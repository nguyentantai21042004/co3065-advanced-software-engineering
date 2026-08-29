import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { heuristicExtractCv, pickPersonName } from './heuristic-cv.js';

const FIXTURE_DIR = join(fileURLToPath(new URL('.', import.meta.url)), '__fixtures__');

describe('heuristicExtractCv', () => {
  it('picks person name instead of job line on EN fixture', () => {
    const text = readFileSync(join(FIXTURE_DIR, 'backend-engineer-en.txt'), 'utf8');
    expect(pickPersonName(text)).toMatch(/Jordan Lee/i);
  });

  it('extracts contact, roles, skills, education from EN fixture', () => {
    const text = readFileSync(join(FIXTURE_DIR, 'backend-engineer-en.txt'), 'utf8');
    const out = heuristicExtractCv(text);
    expect(out.basic_info.email).toContain('jordan.lee');
    expect(out.work_experience.length).toBeGreaterThanOrEqual(2);
    expect(out.work_experience.some((w) => /Acme/i.test(w.company_name ?? ''))).toBe(true);
    expect(out.skills.length).toBeGreaterThanOrEqual(4);
    expect(out.education[0]?.school_name).toMatch(/Berkeley|University/i);
  });

  it('extracts Vietnamese name and roles from VN fixture', () => {
    const text = readFileSync(join(FIXTURE_DIR, 'backend-engineer-vi.txt'), 'utf8');
    const out = heuristicExtractCv(text);
    expect(out.basic_info.name).toMatch(/NGUYỄN VĂN AN/i);
    expect(out.basic_info.phone).toMatch(/0901/);
    expect(out.work_experience.length).toBeGreaterThanOrEqual(2);
    expect(out.certificates_languages.certificates.some((c) => /TOEIC 850/i.test(c.name ?? ''))).toBe(
      true,
    );
  });
});
