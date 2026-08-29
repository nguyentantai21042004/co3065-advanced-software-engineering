import { createHash, randomUUID } from 'node:crypto';
import type {
  AdviceDiffWire,
  AdvicePinStatus,
  AdvicePinWire,
  AdviceSection,
  AdviceSnapshotListWire,
  AdviceSnapshotWire,
  CreateAdvicePinBody,
  PatchAdvicePinBody,
} from '@aicoach/shared/contracts/advice';
import type { CoachingReportWire } from '@aicoach/shared/contracts/cv';
import { badRequest, forbidden, notFound } from '../../platform/errors.js';
import type { UserRepo } from '../users/repo.js';
import { diffCoachingReports } from './diff.js';
import type { AdvicePinRow, AdviceRepo, AdviceSnapshotRow } from './repo.js';

function toIso(value: Date | string): string {
  return (value instanceof Date ? value : new Date(value)).toISOString();
}

function presentSnapshot(row: AdviceSnapshotRow): AdviceSnapshotWire {
  return {
    id: row.id,
    user_id: row.user_id,
    file_id: row.file_id,
    file_name: row.file_name ?? undefined,
    analysis_id: row.analysis_id,
    created_at: toIso(row.created_at),
    domain: row.domain,
    summary: row.summary,
    report: row.report as CoachingReportWire,
    fingerprint: row.fingerprint,
  };
}

function presentPin(row: AdvicePinRow): AdvicePinWire {
  return {
    id: row.id,
    user_id: row.user_id,
    source_snapshot_id: row.source_snapshot_id,
    file_id: row.file_id,
    section: row.section,
    body: row.body,
    status: row.status,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  };
}

/** fingerprintReport hashes normalized coaching sections for cheap equality. */
export function fingerprintReport(report: CoachingReportWire): string {
  const payload = JSON.stringify({
    domain: report.domain_inference.domain,
    titles: report.domain_inference.job_titles,
    findings: report.format_critique.findings,
    strengths: report.experience_comments.strengths,
    gaps: report.experience_comments.gaps,
    recommendations: report.recommendations,
  });
  return createHash('sha256').update(payload.normalize('NFC')).digest('hex').slice(0, 32);
}

function buildSummary(report: CoachingReportWire): string {
  const domain = report.domain_inference.domain;
  const top = report.recommendations[0] ?? report.format_critique.summary;
  return `${domain}: ${top}`.slice(0, 240);
}

export class AdviceService {
  constructor(
    private readonly repo: AdviceRepo,
    private readonly users: UserRepo,
  ) {}

  /** recordSnapshot persists auto advice after CV analysis (worker hook). */
  async recordSnapshot(input: {
    userId: string;
    fileId: string;
    analysisId: string;
    report: CoachingReportWire;
  }): Promise<AdviceSnapshotWire> {
    const row = await this.repo.insertSnapshot({
      id: randomUUID(),
      user_id: input.userId,
      file_id: input.fileId,
      analysis_id: input.analysisId,
      domain: input.report.domain_inference.domain,
      summary: buildSummary(input.report),
      report: input.report,
      fingerprint: fingerprintReport(input.report),
    });
    return presentSnapshot(row);
  }

  async listSnapshots(email: string, limit = 30, before?: string): Promise<AdviceSnapshotListWire> {
    const user = await this.requireUser(email);
    const items = await this.repo.listByUser(user.id, limit, before);
    return { items: items.map(presentSnapshot) };
  }

  async getSnapshot(email: string, id: string): Promise<AdviceSnapshotWire> {
    const user = await this.requireUser(email);
    const row = await this.repo.getById(id);
    if (!row) throw notFound('Snapshot not found');
    if (row.user_id !== user.id) throw forbidden('You do not have access to this snapshot');
    return presentSnapshot(row);
  }

  async diff(email: string, leftId?: string, rightId?: string): Promise<AdviceDiffWire> {
    const user = await this.requireUser(email);
    let left: AdviceSnapshotRow | null = null;
    let right: AdviceSnapshotRow | null = null;

    if (leftId && rightId) {
      left = await this.repo.getById(leftId);
      right = await this.repo.getById(rightId);
    } else {
      const latest = await this.repo.listByUser(user.id, 2);
      if (latest.length < 2) throw badRequest('Cần ít nhất 2 lần phân tích trong account để so sánh');
      right = latest[0]!;
      left = latest[1]!;
    }

    if (!left || !right) throw notFound('Snapshot not found');
    if (left.user_id !== user.id || right.user_id !== user.id) {
      throw forbidden('You do not have access to these snapshots');
    }

    // Ensure left is older for stable UX
    const leftTime = new Date(left.created_at).getTime();
    const rightTime = new Date(right.created_at).getTime();
    if (leftTime > rightTime) {
      const tmp = left;
      left = right;
      right = tmp;
    }

    return diffCoachingReports(
      {
        id: left.id,
        created_at: toIso(left.created_at),
        file_id: left.file_id,
        file_name: left.file_name ?? undefined,
        domain: left.domain,
        summary: left.summary,
      },
      left.report as CoachingReportWire,
      {
        id: right.id,
        created_at: toIso(right.created_at),
        file_id: right.file_id,
        file_name: right.file_name ?? undefined,
        domain: right.domain,
        summary: right.summary,
      },
      right.report as CoachingReportWire,
    );
  }

  async listPins(email: string): Promise<AdvicePinWire[]> {
    const user = await this.requireUser(email);
    const rows = await this.repo.listPins(user.id);
    return rows.map(presentPin);
  }

  async createPin(email: string, body: CreateAdvicePinBody): Promise<AdvicePinWire> {
    const user = await this.requireUser(email);
    if (body.source_snapshot_id) {
      const snap = await this.repo.getById(body.source_snapshot_id);
      if (!snap || snap.user_id !== user.id) throw forbidden('Invalid source snapshot');
    }
    const row = await this.repo.insertPin({
      id: randomUUID(),
      user_id: user.id,
      source_snapshot_id: body.source_snapshot_id ?? null,
      file_id: body.file_id ?? null,
      section: (body.section ?? 'recommendations') as AdviceSection,
      body: body.body.trim(),
      status: (body.status ?? 'todo') as AdvicePinStatus,
    });
    return presentPin(row);
  }

  async patchPin(email: string, id: string, body: PatchAdvicePinBody): Promise<AdvicePinWire> {
    const user = await this.requireUser(email);
    const existing = await this.repo.getPin(id);
    if (!existing) throw notFound('Pin not found');
    if (existing.user_id !== user.id) throw forbidden('You do not have access to this pin');
    if (!body.body && !body.status) throw badRequest('Nothing to update');
    const updated = await this.repo.updatePin(id, {
      body: body.body?.trim(),
      status: body.status,
    });
    if (!updated) throw notFound('Pin not found');
    return presentPin(updated);
  }

  async deletePin(email: string, id: string): Promise<void> {
    const user = await this.requireUser(email);
    const existing = await this.repo.getPin(id);
    if (!existing) throw notFound('Pin not found');
    if (existing.user_id !== user.id) throw forbidden('You do not have access to this pin');
    await this.repo.softDeletePin(id);
  }

  private async requireUser(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw forbidden('user not found');
    return user;
  }
}
