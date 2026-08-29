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
  it('EN backend CV: heuristic fills contact/work/skills/education', () => {
    const text = loadFixture('backend-engineer-en.txt');
    const extracted = heuristicExtractCv(text);

    expect(extracted.basic_info.email).toMatch(/@/);
    expect(extracted.basic_info.phone.length).toBeGreaterThan(6);
    expect(extracted.basic_info.name.toLowerCase()).toContain('jordan');
    expect(extracted.work_experience.length).toBeGreaterThanOrEqual(2);
    expect(extracted.skills.length).toBeGreaterThanOrEqual(4);
    expect(extracted.education.length).toBeGreaterThanOrEqual(1);
  });

  it('VN backend CV: diacritic name + contact + work/skills when date signals present', () => {
    const text = loadFixture('backend-engineer-vi.txt');
    const extracted = heuristicExtractCv(text);

    expect(extracted.basic_info.name).toMatch(/NGUYỄN|NGUYEN/i);
    expect(extracted.basic_info.email).toMatch(/@/);
    expect(extracted.basic_info.phone.length).toBeGreaterThan(6);
    expect(extracted.work_experience.length).toBeGreaterThanOrEqual(1);
    expect(extracted.skills.length).toBeGreaterThanOrEqual(4);
    expect(extracted.education.length).toBeGreaterThanOrEqual(1);
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

  it('buildCoachingReport + exportCoachingReportPdf keep Vietnamese headings', () => {
    const text = loadFixture('backend-engineer-vi.txt');
    const extracted = heuristicExtractCv(text);
    const report = buildCoachingReport(text, extracted);
    const pdf = exportCoachingReportPdf({
      fileName: 'backend-engineer-vi.txt',
      candidateName: extracted.basic_info.name,
      report,
    });

    return pdf.then((bytes) => {
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
        // Fallback: ensure Unicode font path ran (non-trivial size) when pdftotext missing.
        expect(bytes.byteLength).toBeGreaterThan(10_000);
        return;
      }

      expect(extractedText).toMatch(/Báo cáo/);
      expect(extractedText).toMatch(/Định hướng|Nội dung|Kế hoạch|định dạng/i);
      expect(countContentRecs(report.recommendations)).toBeGreaterThanOrEqual(3);
    });
  });

  it('downloaded public sample does not crash extract/coaching path', () => {
    const text = loadFixture('public-awesome-cv-readme.txt');
    const analysis = stubAnalyze(text);
    expect(analysis.coaching_report.recommendations.length).toBeGreaterThan(0);
    expect(analysis.coaching_report.domain_inference.domain.length).toBeGreaterThan(0);
  });
});
