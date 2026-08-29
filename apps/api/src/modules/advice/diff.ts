import type { CoachingReportWire } from '../../contracts/cv.js';
import type { AdviceDiffWire } from '../../contracts/advice.js';

function norm(s: string): string {
  return s.normalize('NFC').trim().replace(/\s+/g, ' ');
}

function setDiff(left: string[], right: string[]): { added: string[]; removed: string[]; unchanged: string[] } {
  const l = new Set(left.map(norm).filter(Boolean));
  const r = new Set(right.map(norm).filter(Boolean));
  const added: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];
  for (const item of r) {
    if (l.has(item)) unchanged.push(item);
    else added.push(item);
  }
  for (const item of l) {
    if (!r.has(item)) removed.push(item);
  }
  return { added, removed, unchanged };
}

export interface DiffSideMeta {
  id: string;
  created_at: string;
  file_id: string;
  file_name?: string;
  domain: string;
  summary: string;
}

/** diffCoachingReports builds account-level advice diff between two snapshots (left = older, right = newer preferred). */
export function diffCoachingReports(
  leftMeta: DiffSideMeta,
  leftReport: CoachingReportWire,
  rightMeta: DiffSideMeta,
  rightReport: CoachingReportWire,
): AdviceDiffWire {
  const domainChanged = norm(leftReport.domain_inference.domain) !== norm(rightReport.domain_inference.domain);
  const recommendations = setDiff(leftReport.recommendations, rightReport.recommendations);
  const format = setDiff(leftReport.format_critique.findings, rightReport.format_critique.findings);
  const strengths = setDiff(
    leftReport.experience_comments.strengths,
    rightReport.experience_comments.strengths,
  );
  const gaps = setDiff(leftReport.experience_comments.gaps, rightReport.experience_comments.gaps);

  return {
    left: leftMeta,
    right: rightMeta,
    changes: {
      domain_changed: domainChanged,
      ...(domainChanged
        ? {
            domain: {
              from: leftReport.domain_inference.domain,
              to: rightReport.domain_inference.domain,
            },
          }
        : {}),
      recommendations: {
        added: recommendations.added,
        removed: recommendations.removed,
        unchanged: recommendations.unchanged,
      },
      format_findings: {
        added: format.added,
        removed: format.removed,
      },
      experience: {
        strengths_added: strengths.added,
        strengths_removed: strengths.removed,
        gaps_added: gaps.added,
        gaps_removed: gaps.removed,
      },
    },
  };
}
