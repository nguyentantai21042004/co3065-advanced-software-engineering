import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { CoachingReportWire } from '../contracts/cv.js';
import { buildCoachingReport } from './coaching-report.js';

export interface ExportReportInput {
  fileName: string;
  candidateName?: string;
  report: CoachingReportWire;
}

function linesForReport(input: ExportReportInput): string[] {
  const { report, fileName, candidateName } = input;
  const out: string[] = ['AI Coach - CV Coaching Report', `Source file: ${fileName}`];
  if (candidateName) out.push(`Candidate: ${candidateName}`);
  out.push('');
  out.push('1. Domain / job inference');
  out.push(`Domain: ${report.domain_inference.domain}`);
  out.push(`Suggested titles: ${report.domain_inference.job_titles.join(', ')}`);
  out.push(report.domain_inference.summary);
  out.push('');
  out.push('2. Format critique');
  out.push(report.format_critique.summary);
  for (const finding of report.format_critique.findings) out.push(`- ${finding}`);
  out.push('');
  out.push('3. Experience comments');
  out.push(report.experience_comments.summary);
  out.push('Strengths:');
  for (const item of report.experience_comments.strengths) out.push(`- ${item}`);
  out.push('Gaps:');
  for (const item of report.experience_comments.gaps) out.push(`- ${item}`);
  out.push('');
  out.push('4. Recommendations');
  for (const item of report.recommendations) out.push(`- ${item}`);
  return out;
}

function wrapLine(text: string, width: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const rows: string[] = [];
  let current = words[0]!;
  for (const word of words.slice(1)) {
    if (`${current} ${word}`.length > width) {
      rows.push(current);
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }
  rows.push(current);
  return rows;
}

/**
 * toWinAnsiSafe folds Vietnamese (and other) diacritics so pdf-lib StandardFonts
 * (WinAnsi) can drawText without throwing "WinAnsi cannot encode".
 */
export function toWinAnsiSafe(text: string): string {
  const folded = text.normalize('NFD').replace(/\p{M}+/gu, '');
  // Keep printable WinAnsi-ish ASCII plus common punctuation; drop the rest.
  return folded.replace(/[^\x20-\x7E\xA0-\xFF]/g, (ch) => {
    if (ch === 'Đ') return 'D';
    if (ch === 'đ') return 'd';
    return '?';
  });
}

/** exportCoachingReportPdf builds a readable PDF from the coaching report object. */
export async function exportCoachingReportPdf(input: ExportReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([595, 842]);
  let y = 800;
  const left = 48;
  const size = 11;

  const draw = (text: string, opts?: { heading?: boolean }) => {
    const useBold = Boolean(opts?.heading);
    const face = useBold ? bold : font;
    const safe = toWinAnsiSafe(text);
    for (const row of wrapLine(safe, 88)) {
      if (y < 56) {
        page = doc.addPage([595, 842]);
        y = 800;
      }
      page.drawText(row, {
        x: left,
        y,
        size: useBold ? 13 : size,
        font: face,
        color: rgb(0.1, 0.1, 0.12),
      });
      y -= useBold ? 20 : 16;
    }
  };

  for (const line of linesForReport(input)) {
    if (!line) {
      y -= 10;
      continue;
    }
    const heading = /^\d\.\s/.test(line) || line.startsWith('AI Coach');
    draw(line, { heading });
  }

  return doc.save();
}

/** exportCoachingReportDocx builds a .docx (ZIP/OOXML) coaching report. */
export async function exportCoachingReportDocx(input: ExportReportInput): Promise<Uint8Array> {
  const { report, fileName, candidateName } = input;
  const children: Paragraph[] = [
    new Paragraph({
      text: 'AI Coach - CV Coaching Report',
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({ children: [new TextRun({ text: `Source file: ${fileName}`, size: 20 })] }),
  ];
  if (candidateName) {
    children.push(new Paragraph({ children: [new TextRun({ text: `Candidate: ${candidateName}`, size: 20 })] }));
  }

  const pushHeading = (title: string) => {
    children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1, spacing: { before: 240 } }));
  };
  const pushText = (text: string) => children.push(new Paragraph({ text }));
  const pushBullet = (text: string) => children.push(new Paragraph({ text, bullet: { level: 0 } }));

  pushHeading('1. Domain / job inference');
  pushText(`Domain: ${report.domain_inference.domain}`);
  pushText(`Suggested titles: ${report.domain_inference.job_titles.join(', ')}`);
  pushText(report.domain_inference.summary);

  pushHeading('2. Format critique');
  pushText(report.format_critique.summary);
  for (const finding of report.format_critique.findings) pushBullet(finding);

  pushHeading('3. Experience comments');
  pushText(report.experience_comments.summary);
  pushText('Strengths:');
  for (const item of report.experience_comments.strengths) pushBullet(item);
  pushText('Gaps:');
  for (const item of report.experience_comments.gaps) pushBullet(item);

  pushHeading('4. Recommendations');
  for (const item of report.recommendations) pushBullet(item);

  const doc = new Document({ sections: [{ children }] });
  const buf = await Packer.toBuffer(doc);
  return new Uint8Array(buf);
}

/** isCoachingReport checks the four required coaching sections exist. */
export function isCoachingReport(value: unknown): value is CoachingReportWire {
  if (!value || typeof value !== 'object') return false;
  const rec = value as Record<string, unknown>;
  const domain = rec.domain_inference as Record<string, unknown> | undefined;
  const format = rec.format_critique as Record<string, unknown> | undefined;
  const experience = rec.experience_comments as Record<string, unknown> | undefined;
  return Boolean(
    domain &&
      typeof domain.domain === 'string' &&
      domain.domain &&
      Array.isArray(domain.job_titles) &&
      domain.job_titles.length > 0 &&
      typeof domain.summary === 'string' &&
      domain.summary &&
      format &&
      typeof format.summary === 'string' &&
      Array.isArray(format.findings) &&
      format.findings.length > 0 &&
      experience &&
      typeof experience.summary === 'string' &&
      Array.isArray(experience.strengths) &&
      experience.strengths.length > 0 &&
      Array.isArray(experience.gaps) &&
      experience.gaps.length > 0 &&
      Array.isArray(rec.recommendations) &&
      (rec.recommendations as unknown[]).length > 0,
  );
}

/**
 * coachingReportFromAnalysis reads a stored analysis_result JSON (or builds from raw text).
 * Prefer the embedded coaching_report when present.
 */
export function coachingReportFromAnalysis(
  analysisResult: unknown,
  rawText = '',
  hints?: Parameters<typeof buildCoachingReport>[1],
): CoachingReportWire {
  if (analysisResult && typeof analysisResult === 'object') {
    const rec = analysisResult as Record<string, unknown>;
    if (isCoachingReport(rec.coaching_report)) return rec.coaching_report;
    if (isCoachingReport(rec)) return rec;
  }
  return buildCoachingReport(rawText || 'Empty CV', hints ?? {});
}
