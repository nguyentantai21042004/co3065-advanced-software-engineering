import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ApiEnvelope } from '@aicoach/shared/contracts/api';
import type { AuthData } from '@aicoach/shared/contracts/auth';
import type { CvDataWire, CvListItemWire, UploadedFileWire } from '@aicoach/shared/contracts/cv';
import { loadConfig } from './config.js';
import { Auth } from './platform/auth.js';
import { makeRepos } from './platform/composition.js';
import { migrate, openDatabase, type Sql } from './platform/db.js';
import { createExtractor } from './platform/extract.js';
import { buildApp } from './platform/http.js';
import { StubAnalyzer } from './platform/llm.js';
import { createInProcessQueue } from './platform/queue.js';
import { createLocalStorage } from './platform/storage.js';

async function parse<T>(res: Response): Promise<ApiEnvelope<T>> {
  return (await res.json()) as ApiEnvelope<T>;
}

async function waitFor<T>(fn: () => Promise<T | null>, timeoutMs = 15_000): Promise<T> {
  const start = Date.now();
  let last: T | null = null;
  while (Date.now() - start < timeoutMs) {
    last = await fn();
    if (last) return last;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('timed out waiting for condition');
}

describe('HTTP contracts', () => {
  let dataDir = '';
  let db: Sql;
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    dataDir = await mkdtemp(join(tmpdir(), 'aicoach-api-'));
    db = await openDatabase({ dataDir, inMemory: true });
    await migrate(db);
    const cfg = loadConfig({
      JWT_SECRET: 'test-jwt-secret',
      DATA_DIR: dataDir,
      PORT: '8090',
    });
    app = buildApp({
      cfg,
      auth: new Auth(cfg),
      repos: makeRepos(db),
      storage: createLocalStorage(join(dataDir, 'files')),
      queue: createInProcessQueue(),
      analyzer: new StubAnalyzer(),
      extractor: createExtractor(),
    });
  });

  afterAll(async () => {
    await db.close();
    await rm(dataDir, { recursive: true, force: true });
  });

  it('register + login return error_code 0 and a token', async () => {
    const email = `user-${Date.now()}@example.com`;
    const password = 'password123';

    const registered = await app.request('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    expect(registered.status).toBe(200);
    const registerBody = await parse<AuthData>(registered);
    expect(registerBody.error_code).toBe(0);
    expect(registerBody.data?.token).toBeTruthy();
    expect(registerBody.data?.email).toBe(email);

    const loggedIn = await app.request('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    expect(loggedIn.status).toBe(200);
    const loginBody = await parse<AuthData>(loggedIn);
    expect(loginBody.error_code).toBe(0);
    expect(loginBody.data?.token).toBeTruthy();
    expect(loginBody.data?.email).toBe(email);
  });

  it('upload + extract + eventually get data, and list history', async () => {
    const email = `cv-${Date.now()}@example.com`;
    const password = 'password123';
    const registered = await app.request('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const auth = await parse<AuthData>(registered);
    const token = auth.data?.token;
    expect(token).toBeTruthy();
    const headers = { Authorization: `Bearer ${token}` };

    const form = new FormData();
    form.append(
      'file',
      new File(['Jane Doe\nSoftware Engineer\njane@example.com\nJava TypeScript\n'], 'cv.pdf', {
        type: 'application/pdf',
      }),
    );

    const uploaded = await app.request('/api/cv/upload', { method: 'POST', headers, body: form });
    expect(uploaded.status).toBe(201);
    const uploadBody = await parse<UploadedFileWire>(uploaded);
    expect(uploadBody.error_code).toBe(0);
    expect(uploadBody.data?.file_id).toBeTruthy();
    expect(uploadBody.data?.original_file_name).toBe('cv.pdf');
    const fileId = uploadBody.data!.file_id;

    const extracted = await app.request(`/api/cv/extract/${fileId}`, { method: 'POST', headers });
    expect(extracted.status).toBe(200);
    const extractBody = await parse<null>(extracted);
    expect(extractBody.error_code).toBe(0);
    expect(extractBody.message).toBe('Task accepted');
    expect(extractBody.data).toBeNull();

    const cvData = await waitFor(async () => {
      const res = await app.request(`/api/cv/data/${fileId}`, { headers });
      if (res.status !== 200) return null;
      const body = await parse<CvDataWire>(res);
      if (body.error_code !== 0) return null;
      if (!body.data?.raw_text && !body.data?.analysis_result && !body.data?.basic_info) return null;
      return body.data;
    });
    expect(cvData.file_id).toBe(fileId);
    expect(cvData.raw_text || cvData.basic_info || cvData.analysis_result).toBeTruthy();

    const listed = await app.request('/api/cv/list', { headers });
    expect(listed.status).toBe(200);
    const listBody = await parse<CvListItemWire[]>(listed);
    expect(listBody.error_code).toBe(0);
    expect(listBody.data?.some((item) => item.file_id === fileId)).toBe(true);
  });
});
