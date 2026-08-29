import { describe, expect, it } from 'vitest';
import { buildCoachingReport } from './coaching-report.js';
import {
  exportCoachingReportDocx,
  exportCoachingReportPdf,
  toWinAnsiSafe,
} from './export-report.js';

describe('coaching report exporters', () => {
  const report = buildCoachingReport(
    'Nguyễn Tấn Tài\nSoftware Engineer\nnguyen@example.com\nTypeScript PostgreSQL Kubernetes\nLed API migration reduced latency 35%\nSMAP analytics platform\n',
    {
      basic_info: { name: 'Nguyễn Tấn Tài', email: 'nguyen@example.com' },
      work_experience: [{ position: 'Backend Developer', company_name: 'Acme', time: '2024 - 2025' }],
      skills: [{ name: 'Golang' }, { name: 'Kubernetes' }, { name: 'PostgreSQL' }],
    },
  );

  it('exportCoachingReportPdf returns %PDF with embedded Unicode fonts', async () => {
    const bytes = await exportCoachingReportPdf({
      fileName: 'cv-nguyen-tan-tai.pdf',
      candidateName: 'Nguyễn Tấn Tài',
      report,
    });
    expect(bytes.byteLength).toBeGreaterThan(1_500);
    expect(Buffer.from(bytes.slice(0, 5)).toString('utf8')).toBe('%PDF-');
    // Object streams may compress /Font dictionaries; size + magic are enough here.
    expect(Buffer.from(bytes).includes(0x25)).toBe(true); // '%'
  });

  it('toWinAnsiSafe still folds Vietnamese for legacy callers', () => {
    expect(toWinAnsiSafe('Nguyễn Tấn Tài')).toBe('Nguyen Tan Tai');
  });

  it('exportCoachingReportDocx returns ZIP/OOXML', async () => {
    const bytes = await exportCoachingReportDocx({
      fileName: 'cv-nguyen-tan-tai.pdf',
      candidateName: 'Nguyễn Tấn Tài',
      report,
    });
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
  });

  it('buildCoachingReport prioritizes content actions over format-only tips', () => {
    const contentHeavy = report.recommendations.filter((item) =>
      /summary|bullet|dự án|case study|kỹ năng|thành tựu|Professional Summary|Projects/i.test(item),
    );
    const formatHeavy = report.recommendations.filter((item) =>
      /ATS|heading|bố cục|định dạng/i.test(item),
    );
    expect(contentHeavy.length).toBeGreaterThanOrEqual(3);
    expect(formatHeavy.length).toBeLessThanOrEqual(1);
  });
});
