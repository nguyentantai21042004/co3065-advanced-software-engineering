import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fontkit from '@pdf-lib/fontkit';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import {
  coachingReportSchema,
  cvAnalysisSchema,
  type CoachingReportWire,
  type CvAnalysis,
} from '../contracts/cv.js';
import { buildCoachingReport, type StructuredCvHints } from './coaching-report.js';

export interface ExportReportInput {
  fileName: string;
  candidateName?: string;
  report: CoachingReportWire;
}

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 56;
const MARGIN_TOP = 56;
const MARGIN_BOTTOM = 52;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONT_DIR = join(__dirname, '../../assets/fonts');

/**
 * toWinAnsiSafe folds Vietnamese diacritics for legacy WinAnsi paths/tests.
 * Prefer embedded Unicode fonts for real PDF export.
 */
export function toWinAnsiSafe(text: string): string {
  const folded = text.normalize('NFD').replace(/\p{M}+/gu, '');
  return folded.replace(/[^\x20-\x7E\xA0-\xFF]/g, (ch) => {
    if (ch === 'Đ') return 'D';
    if (ch === 'đ') return 'd';
    return '?';
  });
}

function wrapByWidth(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [''];
  const words = normalized.split(' ');
  const rows: string[] = [];
  let current = words[0]!;
  for (const word of words.slice(1)) {
    const trial = `${current} ${word}`;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) current = trial;
    else {
      rows.push(current);
      current = word;
    }
  }
  rows.push(current);
  return rows;
}

async function loadUnicodeFonts(doc: PDFDocument): Promise<{ regular: PDFFont; bold: PDFFont }> {
  doc.registerFontkit(fontkit);
  const [regularBytes, boldBytes] = await Promise.all([
    readFile(join(FONT_DIR, 'NotoSans-Regular.ttf')),
    readFile(join(FONT_DIR, 'NotoSans-Bold.ttf')),
  ]);
  return {
    regular: await doc.embedFont(regularBytes, { subset: true }),
    bold: await doc.embedFont(boldBytes, { subset: true }),
  };
}

interface PdfPainter {
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
  doc: PDFDocument;
  pageNo: number;
}

function ensureSpace(p: PdfPainter, need: number): void {
  if (p.y - need >= MARGIN_BOTTOM) return;
  drawFooter(p);
  p.page = p.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  p.pageNo += 1;
  p.y = PAGE_HEIGHT - MARGIN_TOP;
}

function drawFooter(p: PdfPainter): void {
  p.page.drawText(`AI Coach · trang ${p.pageNo}`, {
    x: MARGIN_X,
    y: 28,
    size: 8,
    font: p.regular,
    color: rgb(0.45, 0.47, 0.5),
  });
}

function drawRule(p: PdfPainter): void {
  ensureSpace(p, 14);
  p.page.drawLine({
    start: { x: MARGIN_X, y: p.y },
    end: { x: PAGE_WIDTH - MARGIN_X, y: p.y },
    thickness: 0.6,
    color: rgb(0.82, 0.84, 0.86),
  });
  p.y -= 14;
}

function drawTitle(p: PdfPainter, text: string): void {
  for (const row of wrapByWidth(text, p.bold, 18, CONTENT_WIDTH)) {
    ensureSpace(p, 28);
    p.page.drawText(row, {
      x: MARGIN_X,
      y: p.y,
      size: 18,
      font: p.bold,
      color: rgb(0.08, 0.1, 0.14),
    });
    p.y -= 24;
  }
}

function drawHeading(p: PdfPainter, text: string): void {
  ensureSpace(p, 36);
  p.y -= 8;
  for (const row of wrapByWidth(text, p.bold, 13, CONTENT_WIDTH)) {
    p.page.drawText(row, {
      x: MARGIN_X,
      y: p.y,
      size: 13,
      font: p.bold,
      color: rgb(0.1, 0.12, 0.16),
    });
    p.y -= 18;
  }
  p.page.drawLine({
    start: { x: MARGIN_X, y: p.y + 6 },
    end: { x: MARGIN_X + 72, y: p.y + 6 },
    thickness: 1.4,
    color: rgb(0.15, 0.35, 0.75),
  });
  p.y -= 8;
}

function drawLabelValue(p: PdfPainter, label: string, value: string): void {
  ensureSpace(p, 18);
  const labelText = `${label}: `;
  p.page.drawText(labelText, {
    x: MARGIN_X,
    y: p.y,
    size: 10,
    font: p.bold,
    color: rgb(0.25, 0.28, 0.32),
  });
  const labelWidth = p.bold.widthOfTextAtSize(labelText, 10);
  const rows = wrapByWidth(value, p.regular, 10, CONTENT_WIDTH - labelWidth);
  rows.forEach((row, idx) => {
    if (idx > 0) ensureSpace(p, 14);
    p.page.drawText(row, {
      x: MARGIN_X + (idx === 0 ? labelWidth : 0),
      y: p.y,
      size: 10,
      font: p.regular,
      color: rgb(0.12, 0.14, 0.18),
    });
    p.y -= 14;
  });
}

function drawParagraph(p: PdfPainter, text: string): void {
  for (const row of wrapByWidth(text, p.regular, 10.5, CONTENT_WIDTH)) {
    ensureSpace(p, 15);
    p.page.drawText(row, {
      x: MARGIN_X,
      y: p.y,
      size: 10.5,
      font: p.regular,
      color: rgb(0.14, 0.16, 0.2),
    });
    p.y -= 15;
  }
  p.y -= 4;
}

function drawBullet(p: PdfPainter, text: string): void {
  const rows = wrapByWidth(text, p.regular, 10.5, CONTENT_WIDTH - 16);
  rows.forEach((row, idx) => {
    ensureSpace(p, 15);
    if (idx === 0) {
      p.page.drawText('•', {
        x: MARGIN_X,
        y: p.y,
        size: 10.5,
        font: p.regular,
        color: rgb(0.15, 0.35, 0.75),
      });
    }
    p.page.drawText(row, {
      x: MARGIN_X + 14,
      y: p.y,
      size: 10.5,
      font: p.regular,
      color: rgb(0.14, 0.16, 0.2),
    });
    p.y -= 15;
  });
  p.y -= 2;
}

function drawChipRow(p: PdfPainter, items: string[]): void {
  if (items.length === 0) return;
  let x = MARGIN_X;
  const size = 9;
  const padX = 8;
  const padY = 4;
  ensureSpace(p, 22);
  for (const item of items) {
    const width = p.regular.widthOfTextAtSize(item, size) + padX * 2;
    if (x + width > PAGE_WIDTH - MARGIN_X) {
      p.y -= 22;
      ensureSpace(p, 22);
      x = MARGIN_X;
    }
    p.page.drawRectangle({
      x,
      y: p.y - padY,
      width,
      height: size + padY * 2,
      color: rgb(0.93, 0.95, 0.98),
      borderColor: rgb(0.78, 0.84, 0.92),
      borderWidth: 0.6,
    });
    p.page.drawText(item, {
      x: x + padX,
      y: p.y,
      size,
      font: p.regular,
      color: rgb(0.12, 0.28, 0.55),
    });
    x += width + 6;
  }
  p.y -= 26;
}

/** exportCoachingReportPdf builds an A4 Vietnamese coaching report with embedded Unicode fonts. */
export async function exportCoachingReportPdf(input: ExportReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const { regular, bold } = await loadUnicodeFonts(doc);
  const painter: PdfPainter = {
    page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    y: PAGE_HEIGHT - MARGIN_TOP,
    regular,
    bold,
    doc,
    pageNo: 1,
  };

  const { report, fileName, candidateName } = input;
  const today = new Date().toLocaleDateString('vi-VN');

  drawTitle(painter, 'Báo cáo coaching hồ sơ');
  drawParagraph(
    painter,
    'Tài liệu cố vấn nghề nghiệp: định hướng vị trí, nhận xét nội dung kinh nghiệm, và kế hoạch cải thiện CV trước khi ứng tuyển.',
  );
  drawRule(painter);
  drawLabelValue(painter, 'Ứng viên', candidateName?.trim() || 'Chưa xác định');
  drawLabelValue(painter, 'Nguồn CV', fileName);
  drawLabelValue(painter, 'Ngày xuất', today);
  drawRule(painter);

  drawHeading(painter, '1. Định hướng nghề nghiệp');
  drawLabelValue(painter, 'Lĩnh vực', report.domain_inference.domain);
  drawParagraph(painter, report.domain_inference.summary);
  drawParagraph(painter, 'Vị trí nên nhắm:');
  drawChipRow(painter, report.domain_inference.job_titles);

  drawHeading(painter, '2. Nội dung kinh nghiệm — điểm mạnh');
  drawParagraph(painter, report.experience_comments.summary);
  for (const item of report.experience_comments.strengths) drawBullet(painter, item);

  drawHeading(painter, '3. Khoảng trống nội dung cần bổ sung');
  for (const item of report.experience_comments.gaps) drawBullet(painter, item);

  drawHeading(painter, '4. Kế hoạch hành động (ưu tiên nội dung)');
  report.recommendations.forEach((item, idx) => drawBullet(painter, `${idx + 1}. ${item}`));

  drawHeading(painter, '5. Ghi chú định dạng (phụ)');
  drawParagraph(painter, report.format_critique.summary);
  for (const item of report.format_critique.findings) drawBullet(painter, item);

  drawRule(painter);
  drawParagraph(
    painter,
    'Gợi ý sử dụng: chỉnh nội dung theo mục 4 trước, rồi mới tinh chỉnh bố cục mục 5. Báo cáo này không thay thế CV gốc.',
  );
  drawFooter(painter);

  return doc.save();
}

function docxHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 120 },
  });
}

function docxBody(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 21, font: 'Arial' })],
  });
}

function docxBullet(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 21, font: 'Arial' })],
  });
}

/** exportCoachingReportDocx builds a structured Vietnamese .docx coaching report. */
export async function exportCoachingReportDocx(input: ExportReportInput): Promise<Uint8Array> {
  const { report, fileName, candidateName } = input;
  const today = new Date().toLocaleDateString('vi-VN');
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [new TextRun({ text: 'Báo cáo coaching hồ sơ', bold: true, size: 36, font: 'Arial' })],
    }),
    docxBody(
      'Tài liệu cố vấn nghề nghiệp: định hướng vị trí, nhận xét nội dung kinh nghiệm, và kế hoạch cải thiện CV.',
    ),
    docxBody(`Ứng viên: ${candidateName?.trim() || 'Chưa xác định'}`),
    docxBody(`Nguồn CV: ${fileName}`),
    docxBody(`Ngày xuất: ${today}`),
    docxHeading('1. Định hướng nghề nghiệp'),
    docxBody(`Lĩnh vực: ${report.domain_inference.domain}`),
    docxBody(report.domain_inference.summary),
    docxBody(`Vị trí nên nhắm: ${report.domain_inference.job_titles.join(', ')}`),
    docxHeading('2. Nội dung kinh nghiệm — điểm mạnh'),
    docxBody(report.experience_comments.summary),
    ...report.experience_comments.strengths.map(docxBullet),
    docxHeading('3. Khoảng trống nội dung cần bổ sung'),
    ...report.experience_comments.gaps.map(docxBullet),
    docxHeading('4. Kế hoạch hành động (ưu tiên nội dung)'),
    ...report.recommendations.map((item, idx) => docxBullet(`${idx + 1}. ${item}`)),
    docxHeading('5. Ghi chú định dạng (phụ)'),
    docxBody(report.format_critique.summary),
    ...report.format_critique.findings.map(docxBullet),
    docxBody('Gợi ý sử dụng: chỉnh nội dung theo mục 4 trước, rồi mới tinh chỉnh bố cục mục 5.'),
  ];

  const doc = new Document({
    creator: 'AI Coach',
    title: 'Báo cáo coaching hồ sơ',
    sections: [{ properties: {}, children }],
  });
  return new Uint8Array(await Packer.toBuffer(doc));
}

/** isCoachingReport validates via Zod (four required coaching sections). */
export function isCoachingReport(value: unknown): value is CoachingReportWire {
  return coachingReportSchema.safeParse(value).success;
}

/**
 * coachingReportFromAnalysis reads a stored analysis_result JSON (or builds from raw text).
 * Prefer the embedded coaching_report when present.
 */
export function coachingReportFromAnalysis(
  analysisResult: unknown,
  rawText = '',
  hints?: StructuredCvHints,
): CoachingReportWire {
  const nested = coachingReportSchema.safeParse(
    analysisResult && typeof analysisResult === 'object'
      ? (analysisResult as { coaching_report?: unknown }).coaching_report
      : undefined,
  );
  if (nested.success) return nested.data;
  const asReport = coachingReportSchema.safeParse(analysisResult);
  if (asReport.success) return asReport.data;
  const asAnalysis = cvAnalysisSchema.safeParse(analysisResult);
  if (asAnalysis.success) return asAnalysis.data.coaching_report;
  return buildCoachingReport(rawText || 'CV trống', hints ?? {});
}

/** parseStoredAnalysis coerces JSONB analysis blobs into CvAnalysis when possible. */
export function parseStoredAnalysis(value: unknown): CvAnalysis | null {
  const parsed = cvAnalysisSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
