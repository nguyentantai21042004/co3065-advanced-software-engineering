import { randomUUID } from 'node:crypto';
import { basename, extname } from 'node:path';
import {
  basicInfoSchema,
  certificatesLanguagesSchema,
  coachingReportSchema,
  cvAnalysisSchema,
  educationItemSchema,
  skillItemSchema,
  workExperienceItemSchema,
  type BasicInfo,
  type CoachingReportWire,
  type CvDataWire,
  type CvListItemWire,
  type UploadedFileWire,
} from '../../contracts/cv.js';
import { badRequest, forbidden, notFound, payloadTooLarge } from '../../platform/errors.js';
import {
  coachingReportFromAnalysis,
  exportCoachingReportDocx,
  exportCoachingReportPdf,
} from '../../platform/export-report.js';
import type { FileStorage } from '../../platform/storage.js';
import type { JobQueue } from '../../platform/queue.js';
import type { UserRepo } from '../users/repo.js';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './contract.js';
import type { AnalysisRow, CvRepo, ExtractionRow, ListedFileRow, UploadedFileRow } from './repo.js';

export const EXTRACT_JOB = 'cv.extract';

export interface UploadInput {
  email: string;
  fileName: string;
  contentType: string;
  size: number;
  bytes: Buffer;
}

function toWireTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

function toFileSize(value: number | string): number {
  return typeof value === 'number' ? value : Number(value);
}

function presentFile(row: UploadedFileRow): UploadedFileWire {
  return {
    file_id: row.file_id,
    original_file_name: row.original_file_name,
    content_type: row.content_type,
    file_size: toFileSize(row.file_size),
    uploaded_at: toWireTime(row.uploaded_at),
  };
}

function presentListItem(row: ListedFileRow): CvListItemWire {
  return { ...presentFile(row), status: row.status };
}

function coerceBasicInfo(value: unknown): BasicInfo {
  return basicInfoSchema.parse(value ?? {});
}

function pickCoachingReport(analysis: AnalysisRow, rawText: string | null): CoachingReportWire {
  const nested = coachingReportSchema.safeParse(
    typeof analysis.analysis_result === 'object' && analysis.analysis_result
      ? analysis.analysis_result.coaching_report
      : undefined,
  );
  if (nested.success) return nested.data;

  const fromRow = coachingReportSchema.safeParse(analysis.analysis_result);
  if (fromRow.success) return fromRow.data;

  return coachingReportFromAnalysis(analysis.analysis_result, rawText ?? '', {
    basic_info: coerceBasicInfo(analysis.basic_info),
    education: educationItemSchema.array().parse(analysis.education ?? []),
    work_experience: workExperienceItemSchema.array().parse(analysis.work_experience ?? []),
    skills: skillItemSchema.array().parse(analysis.skills ?? []),
    certificates_languages: certificatesLanguagesSchema.parse(
      analysis.certificates_languages ?? { certificates: [], languages: [] },
    ),
  });
}

function presentCvData(file: UploadedFileRow, extraction: ExtractionRow, analysis: AnalysisRow | null): CvDataWire {
  const data: CvDataWire = {
    file_id: file.file_id,
    extraction_result_id: extraction.id,
    raw_text: extraction.raw_text,
    avatar_id: extraction.avatar_id,
    extraction_completed_at: toWireTime(extraction.created_at),
  };
  if (!analysis) return data;

  const basic_info = coerceBasicInfo(analysis.basic_info);
  const education = educationItemSchema.array().parse(analysis.education ?? []);
  const work_experience = workExperienceItemSchema.array().parse(analysis.work_experience ?? []);
  const skills = skillItemSchema.array().parse(analysis.skills ?? []);
  const certificates_languages = certificatesLanguagesSchema.parse(
    analysis.certificates_languages ?? { certificates: [], languages: [] },
  );
  const coaching_report = pickCoachingReport(analysis, extraction.raw_text);
  const analysis_result =
    cvAnalysisSchema.safeParse(analysis.analysis_result).data ??
    cvAnalysisSchema.parse({
      basic_info,
      education,
      work_experience,
      skills,
      certificates_languages,
      coaching_report,
    });

  data.analysis_result_id = analysis.id;
  data.basic_info = basic_info;
  data.education = education;
  data.work_experience = work_experience;
  data.skills = skills;
  data.certificates_languages = certificates_languages;
  data.analysis_result = analysis_result;
  data.coaching_report = coaching_report;
  data.analysis_completed_at = toWireTime(analysis.created_at);
  return data;
}

export type ExportFormat = 'pdf' | 'docx';

export interface ExportBinary {
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
}

function isAllowed(fileName: string, contentType: string): boolean {
  const ext = extname(fileName).replace('.', '').toLowerCase();
  const mime = (contentType || '').toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext) || ALLOWED_MIME_TYPES.has(mime);
}

export class CvService {
  constructor(
    private readonly repo: CvRepo,
    private readonly users: UserRepo,
    private readonly storage: FileStorage,
    private readonly queue: JobQueue,
  ) {}

  async upload(input: UploadInput): Promise<UploadedFileWire> {
    const fileName = basename(input.fileName || '');
    if (!fileName) throw badRequest('File name is required');
    if (!input.bytes.length || input.size <= 0) throw badRequest('File is empty or input stream cannot be null');
    if (input.size > MAX_FILE_SIZE) throw payloadTooLarge('File size exceeds 10MB limit');
    if (!isAllowed(fileName, input.contentType)) {
      throw badRequest('Unsupported file type. Supported types: PDF, DOCX, DOC');
    }

    const user = await this.users.findByEmail(input.email);
    if (!user) throw forbidden('user not found');

    const fileId = randomUUID();
    const contentType = input.contentType || 'application/octet-stream';
    const storagePath = `${fileId}/${fileName}`;
    await this.storage.put(storagePath, input.bytes, contentType);

    const row = await this.repo.insertFile({
      file_id: fileId,
      user_id: user.id,
      original_file_name: fileName,
      storage_path: storagePath,
      content_type: contentType,
      file_size: input.size,
      uploaded_at: new Date(),
    });
    return presentFile(row);
  }

  async extract(fileId: string, email: string): Promise<void> {
    const file = await this.requireOwnedFile(fileId, email);
    this.queue.enqueue(EXTRACT_JOB, { fileId: file.file_id });
  }

  async getData(fileId: string, email: string): Promise<CvDataWire> {
    const file = await this.requireOwnedFile(fileId, email);
    const extraction = await this.repo.getExtractionByFileId(fileId);
    if (!extraction) throw notFound(`Extraction result not found for file: ${fileId}`);
    const analysis = await this.repo.getAnalysisByFileId(fileId);
    return presentCvData(file, extraction, analysis);
  }

  async list(email: string): Promise<CvListItemWire[]> {
    const user = await this.users.findByEmail(email);
    if (!user) return [];
    const rows = await this.repo.listByUser(user.id);
    return rows.map(presentListItem);
  }

  async exportReport(fileId: string, email: string, format: ExportFormat): Promise<ExportBinary> {
    const file = await this.requireOwnedFile(fileId, email);
    const extraction = await this.repo.getExtractionByFileId(fileId);
    if (!extraction) throw notFound(`Extraction result not found for file: ${fileId}`);
    const analysis = await this.repo.getAnalysisByFileId(fileId);
    if (!analysis) throw notFound('Coaching report is not ready yet; wait for analysis to finish');

    const report = pickCoachingReport(analysis, extraction.raw_text);
    if (!report) throw notFound('Coaching report missing');

    const basic = coerceBasicInfo(analysis.basic_info);
    const candidateName = basic.name || undefined;
    const stem = basename(file.original_file_name, extname(file.original_file_name)) || 'cv';
    const input = { fileName: file.original_file_name, candidateName, report };

    if (format === 'pdf') {
      const bytes = await exportCoachingReportPdf(input);
      return {
        bytes,
        contentType: 'application/pdf',
        fileName: `${stem}-coaching-report.pdf`,
      };
    }

    const bytes = await exportCoachingReportDocx(input);
    return {
      bytes,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileName: `${stem}-coaching-report.docx`,
    };
  }

  private async requireOwnedFile(fileId: string, email: string): Promise<UploadedFileRow> {
    const file = await this.repo.getFile(fileId);
    if (!file) throw notFound('File ID not found in db');
    if (!file.user_id) return file;
    const user = await this.users.findByEmail(email);
    if (!user || user.id !== file.user_id) throw forbidden('You do not have access to this file');
    return file;
  }
}
