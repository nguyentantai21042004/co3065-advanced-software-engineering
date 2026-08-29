import { randomUUID } from 'node:crypto';
import { basename, extname } from 'node:path';
import type { CvDataWire, CvListItemWire, UploadedFileWire } from '@aicoach/shared/contracts/cv';
import { badRequest, forbidden, notFound, payloadTooLarge } from '../../platform/errors.js';
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

function presentCvData(file: UploadedFileRow, extraction: ExtractionRow, analysis: AnalysisRow | null): CvDataWire {
  const data: CvDataWire = {
    file_id: file.file_id,
    extraction_result_id: extraction.id,
    raw_text: extraction.raw_text,
    avatar_id: extraction.avatar_id,
    extraction_completed_at: toWireTime(extraction.created_at),
  };
  if (!analysis) return data;
  data.analysis_result_id = analysis.id;
  data.basic_info = analysis.basic_info;
  data.education = analysis.education;
  data.work_experience = analysis.work_experience;
  data.skills = analysis.skills;
  data.certificates_languages = analysis.certificates_languages;
  data.analysis_result = analysis.analysis_result;
  data.analysis_completed_at = toWireTime(analysis.created_at);
  return data;
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

  private async requireOwnedFile(fileId: string, email: string): Promise<UploadedFileRow> {
    const file = await this.repo.getFile(fileId);
    if (!file) throw notFound('File ID not found in db');
    if (!file.user_id) return file;
    const user = await this.users.findByEmail(email);
    if (!user || user.id !== file.user_id) throw forbidden('You do not have access to this file');
    return file;
  }
}
