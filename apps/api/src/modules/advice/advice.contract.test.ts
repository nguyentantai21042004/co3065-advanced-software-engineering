import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AdviceDiffWire, AdvicePinWire, AdviceSnapshotListWire } from '@aicoach/shared/contracts/advice';
import type { ApiEnvelope } from '@aicoach/shared/contracts/api';
import type { AuthData } from '@aicoach/shared/contracts/auth';
import type { UploadedFileWire } from '@aicoach/shared/contracts/cv';
import { loadConfig } from '../../config.js';
import { Auth } from '../../platform/auth.js';
import { makeRepos } from '../../platform/composition.js';
import { migrate, openDatabase, type Sql } from '../../platform/db.js';
import { createExtractor } from '../../platform/extract.js';
import { buildApp } from '../../platform/http.js';
import { StubAnalyzer } from '../../platform/llm.js';
import { createInProcessQueue } from '../../platform/queue.js';
import { createLocalStorage } from '../../platform/storage.js';

async function parse<T>(res: Response): Promise<ApiEnvelope<T>> {
  return (await res.json()) as ApiEnvelope<T>;
}

async function waitFor<T>(fn: () => Promise<T | null>, timeoutMs = 15_000): Promise<T> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const last = await fn();
    if (last) return last;
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  throw new Error('timed out');
}

describe('advice personalization contracts', () => {
  let dataDir = '';
  let db: Sql;
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    dataDir = await mkdtemp(join(tmpdir(), 'aicoach-advice-'));
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

  it('creates snapshots on analyze, diffs account timeline, and manages pins', async () => {
    const email = `advice-${Date.now()}@example.com`;
    const password = 'password123';
    const registered = await app.request('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const auth = await parse<AuthData>(registered);
    const headers = { Authorization: `Bearer ${auth.data!.token}` };

    async function uploadAndExtract(label: string) {
      const form = new FormData();
      form.append(
        'file',
        new File(
          [`${label}\nSoftware Engineer\n${label}@ex.com\nTypeScript Kubernetes\nLed API cut latency 30%\n`],
          `${label}.pdf`,
          { type: 'application/pdf' },
        ),
      );
      const uploaded = await app.request('/api/cv/upload', { method: 'POST', headers, body: form });
      const up = await parse<UploadedFileWire>(uploaded);
      const fileId = up.data!.file_id;
      await app.request(`/api/cv/extract/${fileId}`, { method: 'POST', headers });
      return fileId;
    }

    await uploadAndExtract('cv-one');
    await uploadAndExtract('cv-two');

    const snaps = await waitFor(async () => {
      const res = await app.request('/api/advice/snapshots', { headers });
      const body = await parse<AdviceSnapshotListWire>(res);
      if (body.error_code !== 0) return null;
      if ((body.data?.items.length ?? 0) < 2) return null;
      return body.data!;
    });
    expect(snaps.items.length).toBeGreaterThanOrEqual(2);
    expect(snaps.items[0]!.report.recommendations.length).toBeGreaterThan(0);

    const diffRes = await app.request('/api/advice/diff', { headers });
    expect(diffRes.status).toBe(200);
    const diffBody = await parse<AdviceDiffWire>(diffRes);
    expect(diffBody.error_code).toBe(0);
    expect(diffBody.data?.left.id).toBeTruthy();
    expect(diffBody.data?.right.id).toBeTruthy();
    expect(diffBody.data?.changes.recommendations).toBeTruthy();

    const pinRes = await app.request('/api/advice/pins', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: snaps.items[0]!.report.recommendations[0],
        section: 'recommendations',
        source_snapshot_id: snaps.items[0]!.id,
        file_id: snaps.items[0]!.file_id,
      }),
    });
    expect(pinRes.status).toBe(201);
    const pinBody = await parse<AdvicePinWire>(pinRes);
    expect(pinBody.data?.status).toBe('todo');
    const pinId = pinBody.data!.id;

    const listed = await parse<AdvicePinWire[]>(await app.request('/api/advice/pins', { headers }));
    expect(listed.data?.some((p) => p.id === pinId)).toBe(true);

    const patched = await parse<AdvicePinWire>(
      await app.request(`/api/advice/pins/${pinId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      }),
    );
    expect(patched.data?.status).toBe('done');

    const deleted = await parse<null>(
      await app.request(`/api/advice/pins/${pinId}`, { method: 'DELETE', headers }),
    );
    expect(deleted.error_code).toBe(0);
  });
});
