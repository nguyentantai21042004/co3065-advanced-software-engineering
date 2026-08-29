import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildCoachingReport } from './coaching-report.js';
import { exportCoachingReportPdf } from './export-report.js';
import { heuristicExtractCv } from './heuristic-cv.js';
import { stubAnalyze } from './llm.js';

const FIXTURE_DIR = join(fileURLToPath(new URL('.', import.meta.url)), '__fixtures__');

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURE_DIR, name), 'utf8');
}

function countContentRecs(recs: string[]): number {
  return recs.filter((item) =>
    /summary|bullet|dự án|case study|kỹ năng|thành tựu|Professional Summary|Projects|stack|bằng chứng/i.test(
      item,
    ),
  ).length;
}

function countFormatRecs(recs: string[]): number {
  return recs.filter((item) => /ATS|heading|bố cục|định dạng|format/i.test(item)).length;
}

describe('business path fixtures (extract → coaching → PDF)', () => {
  it('EN lab CV: heuristic fills contact/work/skills/education', () => {
    const text = loadFixture('backend-engineer-en.txt');
    const extracted = heuristicExtractCv(text);

    expect(extracted.basic_info.email).toMatch(/@/);
    expect(extracted.basic_info.phone.length).toBeGreaterThan(6);
    expect(extracted.basic_info.name.toLowerCase()).toContain('jordan');
    expect(extracted.work_experience.length).toBeGreaterThanOrEqual(2);
    expect(extracted.skills.length).toBeGreaterThanOrEqual(4);
    expect(extracted.education.length).toBeGreaterThanOrEqual(1);
  });

  it('VN lab CV: diacritic name + contact + work/skills/education', () => {
    const text = loadFixture('backend-engineer-vi.txt');
    const extracted = heuristicExtractCv(text);

    expect(extracted.basic_info.name).toMatch(/NGUYỄN|NGUYEN/i);
    expect(extracted.basic_info.email).toMatch(/@/);
    expect(extracted.basic_info.phone.length).toBeGreaterThan(6);
    expect(extracted.work_experience.length).toBeGreaterThanOrEqual(1);
    expect(extracted.skills.length).toBeGreaterThanOrEqual(4);
    expect(extracted.education.length).toBeGreaterThanOrEqual(1);
  });

  it('public JSON Resume sample (Richard Hendriks): enrich contact/work and education or skills', () => {
    const text = loadFixture('public-cv-richard-hendriks.txt');
    const extracted = heuristicExtractCv(text);
    const analysis = stubAnalyze(text);

    expect(extracted.basic_info.name).toMatch(/Richard Hendriks/i);
    expect(extracted.basic_info.email).toMatch(/@/);
    expect(extracted.basic_info.phone.length).toBeGreaterThan(6);
    expect(extracted.work_experience.length).toBeGreaterThanOrEqual(1);
    expect(extracted.work_experience.some((w) => /Pied Piper/i.test(w.company_name ?? ''))).toBe(true);
    expect(
      extracted.skills.length >= 1 || extracted.education.length >= 1,
    ).toBe(true);
    expect(extracted.education[0]?.school_name).toMatch(/Oklahoma|University/i);
    expect(countContentRecs(analysis.coaching_report.recommendations)).toBeGreaterThanOrEqual(3);
    expect(countFormatRecs(analysis.coaching_report.recommendations)).toBeLessThanOrEqual(1);
  });

  it('public Awesome-CV example (Byungjin Park): enrich contact/work/skills/education', () => {
    const text = loadFixture('public-cv-byungjin-park.txt');
    const extracted = heuristicExtractCv(text);
    const analysis = stubAnalyze(text);

    expect(extracted.basic_info.name).toMatch(/Byungjin Park/i);
    expect(extracted.basic_info.email).toMatch(/@/);
    expect(extracted.basic_info.phone.length).toBeGreaterThan(6);
    expect(extracted.work_experience.length).toBeGreaterThanOrEqual(2);
    expect(extracted.work_experience.some((w) => /Dunamu|KarrotPay|Nexon/i.test(w.company_name ?? ''))).toBe(
      true,
    );
    expect(extracted.skills.length).toBeGreaterThanOrEqual(4);
    expect(extracted.education[0]?.school_name).toMatch(/Soongsil|University/i);
    expect(countContentRecs(analysis.coaching_report.recommendations)).toBeGreaterThanOrEqual(3);
  });

  it('Vietnamese-capable public-style CV: diacritics + structured enrich', () => {
    const text = loadFixture('public-cv-vietnam-backend.txt');
    const extracted = heuristicExtractCv(text);
    const analysis = stubAnalyze(text);

    expect(extracted.basic_info.name).toMatch(/TRẦN MINH KHOA|TRAN MINH KHOA/i);
    expect(extracted.basic_info.email).toMatch(/@/);
    expect(extracted.work_experience.length).toBeGreaterThanOrEqual(2);
    expect(extracted.skills.length).toBeGreaterThanOrEqual(4);
    expect(countContentRecs(analysis.coaching_report.recommendations)).toBeGreaterThanOrEqual(3);
  });

  it('stubAnalyze recommendations are majority content-enrichment', () => {
    const text = loadFixture('backend-engineer-en.txt');
    const analysis = stubAnalyze(text);
    const recs = analysis.coaching_report.recommendations;

    expect(recs.length).toBeGreaterThanOrEqual(3);
    expect(countContentRecs(recs)).toBeGreaterThanOrEqual(3);
    expect(countFormatRecs(recs)).toBeLessThanOrEqual(1);
    expect(analysis.work_experience.length).toBeGreaterThanOrEqual(1);
    expect(analysis.skills.length).toBeGreaterThanOrEqual(1);
  });

  it('buildCoachingReport + exportCoachingReportPdf keep Vietnamese headings', async () => {
    const text = loadFixture('public-cv-vietnam-backend.txt');
    const extracted = heuristicExtractCv(text);
    const report = buildCoachingReport(text, extracted);
    const bytes = await exportCoachingReportPdf({
      fileName: 'public-cv-vietnam-backend.txt',
      candidateName: extracted.basic_info.name,
      report,
    });

    expect(Buffer.from(bytes.slice(0, 5)).toString('utf8')).toBe('%PDF-');
    expect(bytes.byteLength).toBeGreaterThan(2_000);

    const outPath = join(tmpdir(), `aicoach-fixture-${Date.now()}.pdf`);
    writeFileSync(outPath, bytes);

    let extractedText = '';
    try {
      extractedText = execFileSync('pdftotext', ['-layout', outPath, '-'], {
        encoding: 'utf8',
        maxBuffer: 2_000_000,
      });
    } catch {
      expect(bytes.byteLength).toBeGreaterThan(10_000);
      return;
    }

    expect(extractedText).toMatch(/Báo cáo/);
    expect(extractedText).toMatch(/Định hướng|Nội dung|Kế hoạch|định dạng/i);
    expect(countContentRecs(report.recommendations)).toBeGreaterThanOrEqual(3);
  });
});
