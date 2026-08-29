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
import { heuristicExtractCv, mergeStructuredCv } from './heuristic-cv.js';

export type { CvAnalysis };

export interface Analyzer {
  analyze(rawText: string): Promise<CvAnalysis>;
  readonly name: string;
}

export type LlmProviderName = 'stub' | 'gemini' | 'pollinations';

const GEMINI_MODEL = 'gemini-2.0-flash';
const MAX_CV_CHARS = 24_000;
const DEFAULT_POLLINATIONS_URL = 'https://text.pollinations.ai/openai';
const DEFAULT_POLLINATIONS_MODEL = 'openai';

/** Prompt shared by Gemini + Pollinations — keep in sync with geminiCvResponseSchema. */
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
- recommendations ưu tiên LÀM GIÀU NỘI DUNG (tóm tắt nghề nghiệp, bullet thành tựu có số liệu, case study dự án, gắn skill với bằng chứng). Chỉ tối đa 1 ý về format/ATS và đặt cuối danh sách.
- experience_comments.strengths/gaps nói về chất lượng nội dung kinh nghiệm/dự án, không chỉ bố cục.

CV text:
`;

function buildAnalysisPrompt(rawText: string): string {
  return `${ANALYSIS_PROMPT_HEADER}${rawText.slice(0, MAX_CV_CHARS)}`;
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

/** stubAnalyze uses local heuristics so profile tab stays useful when LLM is down. */
export function stubAnalyze(rawText: string): CvAnalysis {
  const extracted = heuristicExtractCv(rawText);
  const coaching_report = buildCoachingReport(rawText, extracted);
  return packAnalysis(
    extracted.basic_info,
    extracted.education,
    extracted.work_experience,
    extracted.skills,
    extracted.certificates_languages,
    coaching_report,
  );
}

export class StubAnalyzer implements Analyzer {
  readonly name = 'stub';

  async analyze(rawText: string): Promise<CvAnalysis> {
    return stubAnalyze(rawText);
  }
}

function extractJsonText(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? text).trim();
}

/** Map raw LLM JSON into CvAnalysis; fill empty structured fields from heuristic extract. */
export function analysisFromLlmJson(raw: unknown, rawText: string, fallback: CvAnalysis): CvAnalysis {
  const parsed = geminiCvResponseSchema.parse(decodeUnicodeEscapesDeep(raw));
  const heuristic = heuristicExtractCv(rawText);

  const merged = mergeStructuredCv(
    {
      basic_info: basicInfoSchema.parse({
        ...fallback.basic_info,
        ...parsed.basic_info,
      }),
      education: educationItemSchema.array().parse(parsed.education ?? []),
      work_experience: workExperienceItemSchema.array().parse(parsed.work_experience ?? []),
      skills: skillItemSchema.array().parse(parsed.skills ?? []),
      certificates_languages: certificatesLanguagesSchema.parse({
        certificates: parsed.certificates_languages?.certificates ?? [],
        languages: parsed.certificates_languages?.languages ?? [],
      }),
    },
    {
      basic_info: heuristic.basic_info,
      education: heuristic.education.length ? heuristic.education : fallback.education,
      work_experience: heuristic.work_experience.length
        ? heuristic.work_experience
        : fallback.work_experience,
      skills: heuristic.skills.length ? heuristic.skills : fallback.skills,
      certificates_languages:
        (heuristic.certificates_languages.certificates?.length ?? 0) > 0 ||
        (heuristic.certificates_languages.languages?.length ?? 0) > 0
          ? heuristic.certificates_languages
          : fallback.certificates_languages,
    },
  );

  const reportParsed = coachingReportSchema.safeParse(parsed.coaching_report);
  const coaching_report = reportParsed.success
    ? reportParsed.data
    : buildCoachingReport(rawText, merged);

  return packAnalysis(
    merged.basic_info,
    merged.education,
    merged.work_experience,
    merged.skills,
    merged.certificates_languages,
    coaching_report,
  );
}

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

function openAiMessageText(body: OpenAiChatResponse): string {
  const content = body.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part.text === 'string' ? part.text : ''))
      .join('')
      .trim();
  }
  return '';
}

class GeminiAnalyzer implements Analyzer {
  readonly name = 'gemini';

  constructor(private readonly keys: string[]) {}

  async analyze(rawText: string): Promise<CvAnalysis> {
    const fallback = stubAnalyze(rawText);
    const prompt = buildAnalysisPrompt(rawText);
    let lastError: Error | undefined;

    for (const key of this.keys) {
      try {
        const raw = await this.call(key, prompt);
        return analysisFromLlmJson(raw, rawText, fallback);
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

/** Free, no-API-key OpenAI-compatible endpoint (Pollinations). */
class PollinationsAnalyzer implements Analyzer {
  readonly name = 'pollinations';

  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
  ) {}

  async analyze(rawText: string): Promise<CvAnalysis> {
    const fallback = stubAnalyze(rawText);
    try {
      const raw = await this.call(buildAnalysisPrompt(rawText));
      return analysisFromLlmJson(raw, rawText, fallback);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('pollinations analysis failed; using stub', message);
      return fallback;
    }
  }

  private async call(prompt: string): Promise<unknown> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });
    if (!res.ok) throw new Error(`pollinations http ${res.status}`);

    const body = (await res.json()) as OpenAiChatResponse;
    const text = openAiMessageText(body);
    if (!text) throw new Error('empty pollinations response');
    return JSON.parse(extractJsonText(text)) as unknown;
  }
}

export interface CreateAnalyzerOptions {
  geminiApiKeys?: string[];
  /** stub | gemini | pollinations — default: gemini if keys else pollinations */
  provider?: LlmProviderName;
  pollinationsUrl?: string;
  pollinationsModel?: string;
}

export function createAnalyzer(options: CreateAnalyzerOptions | string[] = {}): Analyzer {
  const opts: CreateAnalyzerOptions = Array.isArray(options)
    ? { geminiApiKeys: options }
    : options;

  const keys = opts.geminiApiKeys ?? [];
  const provider =
    opts.provider ??
    (keys.length > 0 ? 'gemini' : 'pollinations');

  if (provider === 'stub') return new StubAnalyzer();
  if (provider === 'gemini') {
    if (keys.length === 0) {
      console.warn('LLM_PROVIDER=gemini but no GEMINI_API_KEYS; falling back to pollinations');
      return new PollinationsAnalyzer(
        opts.pollinationsUrl ?? DEFAULT_POLLINATIONS_URL,
        opts.pollinationsModel ?? DEFAULT_POLLINATIONS_MODEL,
      );
    }
    return new GeminiAnalyzer(keys);
  }

  return new PollinationsAnalyzer(
    opts.pollinationsUrl ?? DEFAULT_POLLINATIONS_URL,
    opts.pollinationsModel ?? DEFAULT_POLLINATIONS_MODEL,
  );
}
