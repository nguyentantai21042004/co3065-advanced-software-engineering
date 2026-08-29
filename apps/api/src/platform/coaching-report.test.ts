import { describe, expect, it } from 'vitest';
import { buildCoachingReport } from './coaching-report.js';

const FIXTURE = `
Jane Doe
Software Engineer
jane@example.com
+84 900 000 000

SUMMARY
Backend engineer focused on TypeScript APIs and PostgreSQL.

EXPERIENCE
Acme Corp — Software Engineer (2021-2024)
- Led migration of order API; reduced p95 latency 35%
- Owned Kafka consumers for notification pipeline

SKILLS
TypeScript, Node.js, PostgreSQL, Docker, Kubernetes
`;

describe('buildCoachingReport', () => {
  it('fills domain, format, experience, and recommendations for fixture CV text', () => {
    const report = buildCoachingReport(FIXTURE, {
      basic_info: { name: 'Jane Doe', email: 'jane@example.com' },
      work_experience: [{ company_name: 'Acme Corp', position: 'Software Engineer', time: '2021-2024' }],
      skills: [{ name: 'TypeScript', level: 90 }],
    });

    expect(report.domain_inference.domain.length).toBeGreaterThan(0);
    expect(report.domain_inference.job_titles.length).toBeGreaterThan(0);
    expect(report.domain_inference.summary.length).toBeGreaterThan(0);

    expect(report.format_critique.summary.length).toBeGreaterThan(0);
    expect(report.format_critique.findings.length).toBeGreaterThan(0);
    expect(report.format_critique.findings.every((row) => row.length > 0)).toBe(true);

    expect(report.experience_comments.summary.length).toBeGreaterThan(0);
    expect(report.experience_comments.strengths.length).toBeGreaterThan(0);
    expect(report.experience_comments.gaps.length).toBeGreaterThan(0);

    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.recommendations.every((row) => row.length > 0)).toBe(true);

    // Software fixture should not collapse to empty domain
    expect(report.domain_inference.domain.toLowerCase()).toMatch(/software|engineering|professional/);
  });
});
