import { describe, expect, it } from 'vitest';
import { buildCoachingReport } from './coaching-report.js';
import { exportCoachingReportDocx, exportCoachingReportPdf } from './export-report.js';

describe('coaching report exporters', () => {
  const report = buildCoachingReport(
    'Jane Doe\nSoftware Engineer\njane@example.com\nTypeScript PostgreSQL\nLed API migration reduced latency 35%\n',
    {
      basic_info: { name: 'Jane Doe', email: 'jane@example.com' },
      work_experience: [{ position: 'Software Engineer', company_name: 'Acme' }],
      skills: [{ name: 'TypeScript' }],
    },
  );

  it('exportCoachingReportPdf returns %PDF bytes', async () => {
    const bytes = await exportCoachingReportPdf({
      fileName: 'jane-cv.pdf',
      candidateName: 'Jane Doe',
      report,
    });
    expect(bytes.byteLength).toBeGreaterThan(500);
    const head = Buffer.from(bytes.slice(0, 5)).toString('utf8');
    expect(head).toBe('%PDF-');
    // Compressed content streams will not contain plaintext labels; size + magic prove a real PDF.
    const latin = Buffer.from(bytes).toString('latin1');
    expect(latin.includes('endobj') || latin.includes('stream')).toBe(true);
  });

  it('exportCoachingReportDocx returns ZIP/OOXML with word parts', async () => {
    const bytes = await exportCoachingReportDocx({
      fileName: 'jane-cv.pdf',
      candidateName: 'Jane Doe',
      report,
    });
    expect(bytes.byteLength).toBeGreaterThan(100);
    expect(bytes[0]).toBe(0x50); // P
    expect(bytes[1]).toBe(0x4b); // K
    // OOXML stores word/document.xml inside the zip
    const latin = Buffer.from(bytes).toString('latin1');
    expect(latin.includes('word/')).toBe(true);
    expect(latin.includes('document.xml') || latin.includes('word/document')).toBe(true);
  });
});
