import {
  basicInfoSchema,
  certificatesLanguagesSchema,
  coachingReportSchema,
  educationItemSchema,
  geminiCvResponseSchema,
  skillItemSchema,
  workExperienceItemSchema,
  type BasicInfo,
  type CertificatesLanguages,
  type CoachingReportWire,
  type CvAnalysis,
  type EducationItem,
  type SkillItem,
  type WorkExperienceItem,
} from '../contracts/cv.js';
import { buildCoachingReport } from './coaching-report.js';
import { decodeUnicodeEscapesDeep } from './cv-text.js';

export type { CvAnalysis };

export interface Analyzer {
  analyze(rawText: string): Promise<CvAnalysis>;
}

const GEMINI_MODEL = 'gemini-2.0-flash';
const MAX_CV_CHARS = 24_000;

/** Prompt used when GEMINI_API_KEYS is set — keep in sync with geminiCvResponseSchema. */
export const ANALYSIS_PROMPT_HEADER = `Bạn là coach nghề nghiệp tại Việt Nam. Phân tích CV và trả về ĐÚNG một JSON (không markdown) với các khóa:
basic_info (object: name, email, phone, gender 0/1/2, address, date_of_birth),
education (array of {school_name, degree, major, graduation_date}),
work_experience (array of {company_name, position, time}),
skills (array of {name, category, level 0-100, level_label}),
certificates_languages ({certificates:[{name,organization,date}], languages:[{name,proficiency}]}),
coaching_report ({
  domain_inference: { domain, job_titles: string[], summary },
  format_critique: { summary, findings: string[] },
  experience_comments: { summary, strengths: string[], gaps: string[] },
  recommendations: string[]
}).

Yêu cầu:
- Tất cả summary/findings/recommendations/strengths/gaps viết bằng tiếng Việt, cụ thể, actionable.
- domain ngắn gọn (vd "Kỹ thuật phần mềm").
- job_titles có thể giữ tên tiếng Anh phổ biến trên JD VN.
- Không bịa kinh nghiệm không có trong CV.

CV text:
`;

function buildAnalysisPrompt(rawText: string): string {
  return `${ANALYSIS_PROMPT_HEADER}${rawText.slice(0, MAX_CV_CHARS)}`;
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
  return (line ?? 'Ứng viên').slice(0, 120);
}

function emptyCerts(): CertificatesLanguages {
  return { certificates: [], languages: [] };
}

function packAnalysis(
  basic_info: BasicInfo,
  education: EducationItem[],
  work_experience: WorkExperienceItem[],
  skills: SkillItem[],
  certificates_languages: CertificatesLanguages,
  coaching_report: CoachingReportWire,
): CvAnalysis {
  return {
    basic_info,
    education,
    work_experience,
    skills,
    certificates_languages,
    coaching_report,
  };
}

export function stubAnalyze(rawText: string): CvAnalysis {
  const basic_info = basicInfoSchema.parse({
    name: pickName(rawText),
    email: pickEmail(rawText),
    phone: pickPhone(rawText),
    gender: 2,
    address: '',
    date_of_birth: '',
  });
  const education: EducationItem[] = [];
  const work_experience: WorkExperienceItem[] = [];
  const skills: SkillItem[] = [];
  const certificates_languages = emptyCerts();
  const coaching_report = buildCoachingReport(rawText, {
    basic_info,
    education,
    work_experience,
    skills,
    certificates_languages,
  });
  return packAnalysis(
    basic_info,
    education,
    work_experience,
    skills,
    certificates_languages,
    coaching_report,
  );
}

export class StubAnalyzer implements Analyzer {
  async analyze(rawText: string): Promise<CvAnalysis> {
    return stubAnalyze(rawText);
  }
}

function extractJsonText(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? text).trim();
}

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

class GeminiAnalyzer implements Analyzer {
  constructor(private readonly keys: string[]) {}

  async analyze(rawText: string): Promise<CvAnalysis> {
    const fallback = stubAnalyze(rawText);
    const prompt = buildAnalysisPrompt(rawText);
    let lastError: Error | undefined;

    for (const key of this.keys) {
      try {
        const raw = decodeUnicodeEscapesDeep(await this.call(key, prompt));
        const parsed = geminiCvResponseSchema.parse(raw);

        const basic_info = basicInfoSchema.parse({
          ...fallback.basic_info,
          ...parsed.basic_info,
        });
        const education = educationItemSchema.array().parse(parsed.education ?? []);
        const work_experience = workExperienceItemSchema.array().parse(parsed.work_experience ?? []);
        const skills = skillItemSchema.array().parse(parsed.skills ?? []);
        const certificates_languages = certificatesLanguagesSchema.parse({
          certificates: parsed.certificates_languages?.certificates ?? [],
          languages: parsed.certificates_languages?.languages ?? [],
        });

        const reportParsed = coachingReportSchema.safeParse(parsed.coaching_report);
        const coaching_report = reportParsed.success
          ? reportParsed.data
          : buildCoachingReport(rawText, {
              basic_info,
              education,
              work_experience,
              skills,
              certificates_languages,
            });

        return packAnalysis(
          basic_info,
          education,
          work_experience,
          skills,
          certificates_languages,
          coaching_report,
        );
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    console.warn('gemini analysis failed; using stub', lastError?.message);
    return fallback;
  }

  private async call(key: string, prompt: string): Promise<unknown> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) throw new Error(`gemini http ${res.status}`);

    const body = (await res.json()) as GeminiApiResponse;
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('empty gemini response');
    return JSON.parse(extractJsonText(text)) as unknown;
  }
}

export function createAnalyzer(keys: string[]): Analyzer {
  if (keys.length > 0) return new GeminiAnalyzer(keys);
  return new StubAnalyzer();
}
