import type { CoachingReportWire } from '../../contracts/cv.js';
import type { AdvicePinStatus, AdviceSection } from '../../contracts/advice.js';
import type { Sql } from '../../platform/db.js';

export interface AdviceSnapshotRow {
  id: string;
  user_id: string;
  file_id: string;
  analysis_id: string;
  created_at: Date | string;
  domain: string;
  summary: string;
  report: CoachingReportWire | string;
  fingerprint: string;
  file_name?: string | null;
}

export interface AdvicePinRow {
  id: string;
  user_id: string;
  source_snapshot_id: string | null;
  file_id: string | null;
  section: AdviceSection;
  body: string;
  status: AdvicePinStatus;
  created_at: Date | string;
  updated_at: Date | string;
}

function jsonParam(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function parseReport(value: CoachingReportWire | string): CoachingReportWire {
  if (typeof value === 'string') return JSON.parse(value) as CoachingReportWire;
  return value;
}

export class AdviceRepo {
  constructor(private readonly db: Sql) {}

  async insertSnapshot(row: {
    id: string;
    user_id: string;
    file_id: string;
    analysis_id: string;
    domain: string;
    summary: string;
    report: CoachingReportWire;
    fingerprint: string;
    created_at?: Date;
  }): Promise<AdviceSnapshotRow> {
    const rows = await this.db.query<AdviceSnapshotRow>(
      `INSERT INTO advice_snapshot
        (id, user_id, file_id, analysis_id, domain, summary, report, fingerprint, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, COALESCE($9, CURRENT_TIMESTAMP))
       RETURNING id, user_id, file_id, analysis_id, created_at, domain, summary, report, fingerprint`,
      [
        row.id,
        row.user_id,
        row.file_id,
        row.analysis_id,
        row.domain,
        row.summary,
        jsonParam(row.report),
        row.fingerprint,
        row.created_at ?? null,
      ],
    );
    const created = rows[0];
    if (!created) throw new Error('failed to insert advice_snapshot');
    return { ...created, report: parseReport(created.report) };
  }

  async listByUser(userId: string, limit: number, before?: string): Promise<AdviceSnapshotRow[]> {
    const rows = before
      ? await this.db.query<AdviceSnapshotRow>(
          `SELECT s.id, s.user_id, s.file_id, s.analysis_id, s.created_at, s.domain, s.summary, s.report, s.fingerprint,
                  f.original_file_name AS file_name
           FROM advice_snapshot s
           LEFT JOIN uploaded_file f ON f.file_id = s.file_id
           WHERE s.user_id = $1 AND s.created_at < $2::timestamptz
           ORDER BY s.created_at DESC
           LIMIT $3`,
          [userId, before, limit],
        )
      : await this.db.query<AdviceSnapshotRow>(
          `SELECT s.id, s.user_id, s.file_id, s.analysis_id, s.created_at, s.domain, s.summary, s.report, s.fingerprint,
                  f.original_file_name AS file_name
           FROM advice_snapshot s
           LEFT JOIN uploaded_file f ON f.file_id = s.file_id
           WHERE s.user_id = $1
           ORDER BY s.created_at DESC
           LIMIT $2`,
          [userId, limit],
        );
    return rows.map((r) => ({ ...r, report: parseReport(r.report) }));
  }

  async getById(id: string): Promise<AdviceSnapshotRow | null> {
    const rows = await this.db.query<AdviceSnapshotRow>(
      `SELECT s.id, s.user_id, s.file_id, s.analysis_id, s.created_at, s.domain, s.summary, s.report, s.fingerprint,
              f.original_file_name AS file_name
       FROM advice_snapshot s
       LEFT JOIN uploaded_file f ON f.file_id = s.file_id
       WHERE s.id = $1
       LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? { ...row, report: parseReport(row.report) } : null;
  }

  async insertPin(row: {
    id: string;
    user_id: string;
    source_snapshot_id: string | null;
    file_id: string | null;
    section: AdviceSection;
    body: string;
    status: AdvicePinStatus;
  }): Promise<AdvicePinRow> {
    const rows = await this.db.query<AdvicePinRow>(
      `INSERT INTO advice_pin
        (id, user_id, source_snapshot_id, file_id, section, body, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, source_snapshot_id, file_id, section, body, status, created_at, updated_at`,
      [row.id, row.user_id, row.source_snapshot_id, row.file_id, row.section, row.body, row.status],
    );
    const created = rows[0];
    if (!created) throw new Error('failed to insert advice_pin');
    return created;
  }

  async listPins(userId: string): Promise<AdvicePinRow[]> {
    return this.db.query<AdvicePinRow>(
      `SELECT id, user_id, source_snapshot_id, file_id, section, body, status, created_at, updated_at
       FROM advice_pin
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [userId],
    );
  }

  async getPin(id: string): Promise<AdvicePinRow | null> {
    const rows = await this.db.query<AdvicePinRow>(
      `SELECT id, user_id, source_snapshot_id, file_id, section, body, status, created_at, updated_at
       FROM advice_pin WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async updatePin(
    id: string,
    patch: { body?: string; status?: AdvicePinStatus },
  ): Promise<AdvicePinRow | null> {
    const rows = await this.db.query<AdvicePinRow>(
      `UPDATE advice_pin
       SET body = COALESCE($2, body),
           status = COALESCE($3, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, user_id, source_snapshot_id, file_id, section, body, status, created_at, updated_at`,
      [id, patch.body ?? null, patch.status ?? null],
    );
    return rows[0] ?? null;
  }

  async softDeletePin(id: string): Promise<boolean> {
    const rows = await this.db.query<{ id: string }>(
      `UPDATE advice_pin SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id],
    );
    return Boolean(rows[0]);
  }
}
