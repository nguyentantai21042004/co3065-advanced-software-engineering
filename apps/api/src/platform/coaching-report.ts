import type { CoachingReportWire } from '@aicoach/shared/contracts/cv';

export interface StructuredCvHints {
  basic_info?: Record<string, unknown>;
  education?: unknown;
  work_experience?: unknown;
  skills?: unknown;
  certificates_languages?: unknown;
}

const DOMAIN_KEYWORDS: { domain: string; titles: string[]; needles: RegExp }[] = [
  {
    domain: 'Software Engineering',
    titles: ['Software Engineer', 'Backend Engineer', 'Full-stack Developer'],
    needles: /\b(typescript|javascript|java|golang|go\b|python|react|node\.?js|spring|kubernetes|microservice|api)\b/i,
  },
  {
    domain: 'Data / Analytics',
    titles: ['Data Analyst', 'Data Engineer', 'ML Engineer'],
    needles: /\b(sql|pandas|spark|etl|machine learning|data science|tableau|warehouse)\b/i,
  },
  {
    domain: 'Product / Design',
    titles: ['Product Manager', 'UX Designer', 'Product Designer'],
    needles: /\b(product manager|figma|user research|wireframe|roadmap|ux|ui design)\b/i,
  },
  {
    domain: 'Operations / Business',
    titles: ['Operations Specialist', 'Business Analyst', 'Project Coordinator'],
    needles: /\b(operations|business analyst|stakeholder|kpi|process improvement|excel)\b/i,
  },
];

function asList(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === 'object') as Record<string, unknown>[];
  }
  return [];
}

function lineCount(text: string): number {
  return text.split(/\r?\n/).filter((line) => line.trim()).length;
}

function hasEmail(text: string): boolean {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
}

function hasPhone(text: string): boolean {
  return /(?:\+?\d[\d\s().-]{7,}\d)/.test(text);
}

function inferDomain(rawText: string, hints: StructuredCvHints): CoachingReportWire['domain_inference'] {
  const blob = `${rawText}\n${JSON.stringify(hints.skills ?? {})}\n${JSON.stringify(hints.work_experience ?? {})}`;
  for (const row of DOMAIN_KEYWORDS) {
    if (row.needles.test(blob)) {
      return {
        domain: row.domain,
        job_titles: row.titles,
        summary: `Based on skills and wording in the CV, the strongest fit is ${row.domain}. Target roles such as ${row.titles.join(', ')}.`,
      };
    }
  }
  const titleHint = asList(hints.work_experience)[0];
  const position = String(titleHint?.position ?? titleHint?.title ?? '').trim();
  if (position) {
    return {
      domain: 'General professional',
      job_titles: [position],
      summary: `The CV leans toward roles similar to "${position}". Clarify domain keywords so recruiters can classify the profile faster.`,
    };
  }
  return {
    domain: 'General professional',
    job_titles: ['Individual Contributor', 'Specialist'],
    summary:
      'Domain signals are thin. Add a one-line professional summary and 5–8 role keywords so the intended job family is obvious.',
  };
}

function critiqueFormat(rawText: string, hints: StructuredCvHints): CoachingReportWire['format_critique'] {
  const findings: string[] = [];
  const lines = lineCount(rawText);
  if (lines < 8) {
    findings.push('The CV body is very short; expand into clear sections (Summary, Experience, Education, Skills).');
  }
  if (!hasEmail(rawText) && !String(hints.basic_info?.email ?? '')) {
    findings.push('No email address detected in the header — recruiters need a reachable contact.');
  }
  if (!hasPhone(rawText) && !String(hints.basic_info?.phone ?? '')) {
    findings.push('Phone number is missing; optional but still common for local applications.');
  }
  if (!/\b(experience|work|employment|education|skills|projects)\b/i.test(rawText)) {
    findings.push('Section headings are unclear or missing; use consistent headings recruiters can scan.');
  }
  if (rawText.length > 6_000) {
    findings.push('The document is long for a first screen; trim older roles and keep the first page focused.');
  }
  if (asList(hints.work_experience).length === 0 && !/\b(20\d{2}|19\d{2})\b/.test(rawText)) {
    findings.push('Dates / timeline markers are weak; add start–end years next to each role.');
  }
  if (findings.length === 0) {
    findings.push('Structure looks readable; keep headings consistent and prefer bullet achievements over long paragraphs.');
  }
  return {
    summary:
      findings.length >= 3
        ? 'Format needs tightening before you send it to ATS or hiring managers.'
        : 'Format is usable with a few polish items.',
    findings,
  };
}

function commentExperience(
  rawText: string,
  hints: StructuredCvHints,
): CoachingReportWire['experience_comments'] {
  const roles = asList(hints.work_experience);
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (roles.length > 0) {
    strengths.push(`Parsed ${roles.length} work experience entr${roles.length === 1 ? 'y' : 'ies'} from the CV.`);
  } else if (/\b(engineer|developer|analyst|manager|intern)\b/i.test(rawText)) {
    strengths.push('Role titles appear in the text even if structured experience was sparse.');
  } else {
    gaps.push('Little concrete work history is visible — add 2–3 roles with scope and impact.');
  }

  if (/\b(\d+%|increased|reduced|led|owned|shipped|launched)\b/i.test(rawText)) {
    strengths.push('Some achievement / impact language is present (metrics or ownership verbs).');
  } else {
    gaps.push('Achievements read generic; rewrite bullets with action + context + measurable result.');
  }

  if (asList(hints.skills).length > 0 || /\b(skills?|technologies)\b/i.test(rawText)) {
    strengths.push('Skills are mentioned; group them by category (languages, tools, soft skills).');
  } else {
    gaps.push('Skill list is thin — surface the tools you actually used in recent roles.');
  }

  if (strengths.length === 0) {
    strengths.push('There is enough raw material to build a stronger narrative with editing.');
  }
  if (gaps.length === 0) {
    gaps.push('Deepen one flagship project so reviewers understand your strongest contribution.');
  }

  return {
    summary:
      roles.length > 0
        ? 'Experience is present but should emphasize outcomes over duties.'
        : 'Experience narrative needs more concrete roles and outcomes.',
    strengths,
    gaps,
  };
}

function buildRecommendations(
  domain: CoachingReportWire['domain_inference'],
  format: CoachingReportWire['format_critique'],
  experience: CoachingReportWire['experience_comments'],
): string[] {
  const out: string[] = [
    `Lead with a 2–3 sentence summary aimed at ${domain.job_titles[0] ?? domain.domain}.`,
    'Rewrite each recent role with 3–5 bullets: action verb, scope, and a metric where possible.',
    `Mirror keywords from ${domain.domain} job posts in the skills and summary sections (honest matches only).`,
  ];
  if (format.findings[0]) out.push(`Format fix: ${format.findings[0]}`);
  if (experience.gaps[0]) out.push(`Experience fix: ${experience.gaps[0]}`);
  out.push('Export the coaching report (PDF/Word) and iterate before sending applications.');
  return out.slice(0, 6);
}

/**
 * buildCoachingReport turns raw CV text plus structured extract hints into the four
 * coaching sections used by the API wire and PDF/Word exporters.
 */
export function buildCoachingReport(rawText: string, hints: StructuredCvHints = {}): CoachingReportWire {
  const text = (rawText || '').trim() || 'Empty CV';
  const domain_inference = inferDomain(text, hints);
  const format_critique = critiqueFormat(text, hints);
  const experience_comments = commentExperience(text, hints);
  const recommendations = buildRecommendations(domain_inference, format_critique, experience_comments);
  return {
    domain_inference,
    format_critique,
    experience_comments,
    recommendations,
  };
}
