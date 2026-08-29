import type { CoachingReportWire } from '@aicoach/shared/contracts/cv';
import { buildCoachingReport } from './coaching-report.js';

export interface CvAnalysis {
  basic_info: Record<string, unknown>;
  education: unknown;
  work_experience: unknown;
  skills: unknown;
  certificates_languages: unknown;
  coaching_report: CoachingReportWire;
  analysis_result: Record<string, unknown>;
}

export interface Analyzer {
  analyze(rawText: string): Promise<CvAnalysis>;
}

function pickEmail(text: string): string {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? '';
}

function pickPhone(text: string): string {
  return text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.replace(/\s+/g, '') ?? '';
}

function pickName(text: string): string {
  const line = text
    .split('\n')
    .map((row) => row.trim())
    .find((row) => row && !row.includes('@') && !/^\d/.test(row));
  return (line ?? 'Candidate').slice(0, 120);
}

export function stubAnalyze(rawText: string): CvAnalysis {
  const basic_info = {
    name: pickName(rawText),
    email: pickEmail(rawText),
    phone: pickPhone(rawText),
    gender: 2,
    address: '',
    date_of_birth: '',
  };
  const education: unknown[] = [];
  const work_experience: unknown[] = [];
  const skills: unknown[] = [];
  const certificates_languages = { certificates: [], languages: [] };
  const coaching_report = buildCoachingReport(rawText, {
    basic_info,
    education,
    work_experience,
    skills,
    certificates_languages,
  });
  return {
    basic_info,
    education,
    work_experience,
    skills,
    certificates_languages,
    coaching_report,
    analysis_result: {
      basic_info,
      education,
      work_experience,
      skills,
      certificates_languages,
      coaching_report,
    },
  };
}

export class StubAnalyzer implements Analyzer {
  async analyze(rawText: string): Promise<CvAnalysis> {
    return stubAnalyze(rawText);
  }
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  return JSON.parse(raw) as unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

class GeminiAnalyzer implements Analyzer {
  constructor(private readonly keys: string[]) {}

  async analyze(rawText: string): Promise<CvAnalysis> {
    const fallback = stubAnalyze(rawText);
    const prompt = `Extract structured CV data. Return ONLY JSON with keys:
basic_info (object: name, email, phone, gender 0/1/2, address, date_of_birth),
education (array of {school_name, degree, major, graduation_date}),
work_experience (array of {company_name, position, time}),
skills (array of {name, category, level 0-100, level_label}),
certificates_languages ({certificates:[{name,organization,date}], languages:[{name,proficiency}]}).

CV text:
${rawText.slice(0, 24_000)}`;

    let lastError: unknown;
    for (const key of this.keys) {
      try {
        const parsed = asRecord(await this.call(key, prompt));
        const basic_info = asRecord(parsed.basic_info ?? parsed);
        const education = parsed.education ?? [];
        const work_experience = parsed.work_experience ?? [];
        const skills = parsed.skills ?? [];
        const certificates_languages =
          parsed.certificates_languages ?? { certificates: parsed.certificates ?? [], languages: parsed.languages ?? [] };
        const resolvedBasic = Object.keys(basic_info).length ? basic_info : fallback.basic_info;
        const coaching_report = buildCoachingReport(rawText, {
          basic_info: resolvedBasic,
          education,
          work_experience,
          skills,
          certificates_languages,
        });
        return {
          basic_info: resolvedBasic,
          education,
          work_experience,
          skills,
          certificates_languages,
          coaching_report,
          analysis_result: {
            basic_info: resolvedBasic,
            education,
            work_experience,
            skills,
            certificates_languages,
            coaching_report,
          },
        };
      } catch (err) {
        lastError = err;
      }
    }
    console.warn('gemini analysis failed; using stub', lastError);
    return fallback;
  }

  private async call(key: string, prompt: string): Promise<unknown> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) throw new Error(`gemini http ${res.status}`);
    const body = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('empty gemini response');
    return extractJson(text);
  }
}

export function createAnalyzer(keys: string[]): Analyzer {
  if (keys.length > 0) return new GeminiAnalyzer(keys);
  return new StubAnalyzer();
}
