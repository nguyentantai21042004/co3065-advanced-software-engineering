import type {
  BasicInfo,
  CertificatesLanguages,
  CvAnalysis,
  EducationItem,
  SkillItem,
  WorkExperienceItem,
} from '../../contracts/cv.js';
import type { Sql } from '../../platform/db.js';

export interface UploadedFileRow {
  file_id: string;
  user_id: string | null;
  original_file_name: string;
  storage_path: string;
  content_type: string;
  file_size: number | string;
  uploaded_at: Date | string;
}

export interface ExtractionInsert {
  id: string;
  file_id: string;
  raw_text: string | null;
  avatar_id: string | null;
}

export interface ExtractionRow extends ExtractionInsert {
  created_at: Date | string;
}

export interface AnalysisInsert {
  id: string;
  extraction_result_id: string;
  file_id: string;
  basic_info: BasicInfo;
  education: EducationItem[];
  work_experience: WorkExperienceItem[];
  skills: SkillItem[];
  certificates_languages: CertificatesLanguages;
  analysis_result: CvAnalysis;
}

export interface AnalysisRow extends AnalysisInsert {
  created_at: Date | string;
}

export interface ListedFileRow extends UploadedFileRow {
  status: 'uploaded' | 'processing' | 'completed';
}

function jsonParam(value: BasicInfo | EducationItem[] | WorkExperienceItem[] | SkillItem[] | CertificatesLanguages | CvAnalysis): string {
  return JSON.stringify(value);
}

export class CvRepo {
  constructor(private readonly db: Sql) {}

  async insertFile(row: UploadedFileRow): Promise<UploadedFileRow> {
    const rows = await this.db.query<UploadedFileRow>(
      `INSERT INTO uploaded_file
        (file_id, user_id, original_file_name, storage_path, content_type, file_size, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING file_id, user_id, original_file_name, storage_path, content_type, file_size, uploaded_at`,
      [
        row.file_id,
        row.user_id,
        row.original_file_name,
        row.storage_path,
        row.content_type,
        row.file_size,
        row.uploaded_at,
      ],
    );
    const created = rows[0];
    if (!created) throw new Error('failed to insert uploaded file');
    return created;
  }

  async getFile(fileId: string): Promise<UploadedFileRow | null> {
    const rows = await this.db.query<UploadedFileRow>(
      `SELECT file_id, user_id, original_file_name, storage_path, content_type, file_size, uploaded_at
       FROM uploaded_file WHERE file_id = $1 AND deleted_at IS NULL LIMIT 1`,
      [fileId],
    );
    return rows[0] ?? null;
  }

  async listByUser(userId: string): Promise<ListedFileRow[]> {
    return this.db.query<ListedFileRow>(
      `SELECT f.file_id, f.user_id, f.original_file_name, f.storage_path, f.content_type, f.file_size, f.uploaded_at,
              CASE
                WHEN a.id IS NOT NULL THEN 'completed'
                WHEN e.id IS NOT NULL THEN 'processing'
                ELSE 'uploaded'
              END AS status
       FROM uploaded_file f
       LEFT JOIN LATERAL (
         SELECT id FROM extraction_result WHERE file_id = f.file_id AND deleted_at IS NULL
         ORDER BY created_at DESC LIMIT 1
       ) e ON TRUE
       LEFT JOIN LATERAL (
         SELECT id FROM cv_analysis_result WHERE file_id = f.file_id AND deleted_at IS NULL
         ORDER BY created_at DESC LIMIT 1
       ) a ON TRUE
       WHERE f.user_id = $1 AND f.deleted_at IS NULL
       ORDER BY f.uploaded_at DESC`,
      [userId],
    );
  }

  async insertExtraction(row: ExtractionInsert): Promise<ExtractionRow> {
    const rows = await this.db.query<ExtractionRow>(
      `INSERT INTO extraction_result (id, file_id, raw_text, avatar_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, file_id, raw_text, avatar_id, created_at`,
      [row.id, row.file_id, row.raw_text, row.avatar_id],
    );
    const created = rows[0];
    if (!created) throw new Error('failed to insert extraction');
    return created;
  }

  async getExtractionByFileId(fileId: string): Promise<ExtractionRow | null> {
    const rows = await this.db.query<ExtractionRow>(
      `SELECT id, file_id, raw_text, avatar_id, created_at
       FROM extraction_result
       WHERE file_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [fileId],
    );
    return rows[0] ?? null;
  }

  async insertAnalysis(row: AnalysisInsert): Promise<AnalysisRow> {
    const rows = await this.db.query<AnalysisRow>(
      `INSERT INTO cv_analysis_result
        (id, extraction_result_id, file_id, basic_info, education, work_experience, skills, certificates_languages, analysis_result)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb)
       RETURNING id, extraction_result_id, file_id, basic_info, education, work_experience, skills, certificates_languages, analysis_result, created_at`,
      [
        row.id,
        row.extraction_result_id,
        row.file_id,
        jsonParam(row.basic_info),
        jsonParam(row.education),
        jsonParam(row.work_experience),
        jsonParam(row.skills),
        jsonParam(row.certificates_languages),
        jsonParam(row.analysis_result),
      ],
    );
    const created = rows[0];
    if (!created) throw new Error('failed to insert analysis');
    return created;
  }

  async getAnalysisByFileId(fileId: string): Promise<AnalysisRow | null> {
    const rows = await this.db.query<AnalysisRow>(
      `SELECT id, extraction_result_id, file_id, basic_info, education, work_experience, skills, certificates_languages, analysis_result, created_at
       FROM cv_analysis_result
       WHERE file_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [fileId],
    );
    return rows[0] ?? null;
  }
}
