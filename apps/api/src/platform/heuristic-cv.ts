import {
  basicInfoSchema,
  certificatesLanguagesSchema,
  educationItemSchema,
  skillItemSchema,
  workExperienceItemSchema,
  type BasicInfo,
  type CertificatesLanguages,
  type EducationItem,
  type SkillItem,
  type WorkExperienceItem,
} from '../contracts/cv.js';

const MONTH =
  '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Otc|Nov(?:ember)?|Dec(?:ember)?)';

const PERIOD_RE = new RegExp(
  `\\b(${MONTH}\\.?\\s+\\d{4}\\s*[-–—]\\s*(?:Present|Hiện\\s*tại|${MONTH}\\.?\\s+\\d{4}|\\d{4}))`,
  'i',
);

// Split company/position on spaced hyphen so names like ROBO-HI stay intact.
const ROLE_LINE_RE = new RegExp(
  `\\b(${MONTH}\\.?\\s+\\d{4}\\s*[-–—]\\s*(?:Present|Hiện\\s*tại|${MONTH}\\.?\\s+\\d{4}|\\d{4}))\\s*([A-Z0-9][\\w .,&()/'+-]{1,90}?)\\s+-\\s+([^\\n]{3,100})`,
  'gi',
);

const SKILL_CATS: { category: string; re: RegExp; level: number }[] = [
  {
    category: 'Backend',
    re: /\b(golang|go\b|gin|fastapi|spring\s*boot|laravel|node\.?js|typescript|python|java)\b/gi,
    level: 78,
  },
  {
    category: 'Data / Messaging',
    re: /\b(postgresql|mongodb|redis|rabbitmq|sqlboiler|mqtt)\b/gi,
    level: 72,
  },
  {
    category: 'DevOps',
    re: /\b(kubernetes|k8s|docker|jenkins|rancher|terraform|nginx|harbor|containerd)\b/gi,
    level: 70,
  },
  { category: 'Cloud', re: /\b(aws|ec2|s3|iam|vpc|lambda|minio)\b/gi, level: 68 },
  { category: 'Frontend', re: /\b(react|next\.?js|websocket)\b/gi, level: 65 },
];

function pickEmail(text: string): string {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? '';
}

function pickPhone(text: string): string {
  return text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.replace(/\s+/g, '') ?? '';
}

function looksLikeJobOrPeriod(line: string): boolean {
  if (PERIOD_RE.test(line)) return true;
  if (/\b(backend|frontend|developer|engineer|intern|part\s*time|full\s*time)\b/i.test(line)) {
    return true;
  }
  if (/\b(ltd|jsc|company|co\.,|corp)\b/i.test(line)) return true;
  return false;
}

/** pickPersonName prefers ALL-CAPS person lines, then the line above email. */
export function pickPersonName(text: string): string {
  const lines = text
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (
      /^[A-ZÀ-Ỹ][A-ZÀ-Ỹ\s'.]{4,60}$/.test(line) &&
      line.split(/\s+/).length >= 2 &&
      line.split(/\s+/).length <= 6 &&
      !looksLikeJobOrPeriod(line)
    ) {
      return line.replace(/\s+/g, ' ').trim();
    }
  }

  const emailIdx = lines.findIndex((row) => row.includes('@'));
  if (emailIdx > 0) {
    const prev = lines[emailIdx - 1]!;
    if (
      prev.length >= 4 &&
      prev.length <= 80 &&
      !looksLikeJobOrPeriod(prev) &&
      !prev.includes('http')
    ) {
      return prev.replace(/\s+/g, ' ').trim();
    }
  }

  const titled = lines.find(
    (row) =>
      !row.includes('@') &&
      !/^\d/.test(row) &&
      !looksLikeJobOrPeriod(row) &&
      row.length <= 60 &&
      /^[A-Za-zÀ-ỹ]/.test(row),
  );
  return (titled ?? 'Ứng viên').slice(0, 120);
}

function pickWork(text: string): WorkExperienceItem[] {
  const out: WorkExperienceItem[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(ROLE_LINE_RE)) {
    const time = (match[1] ?? '').replace(/\s+/g, ' ').trim();
    const company = (match[2] ?? '').replace(/\s+/g, ' ').trim();
    const position = (match[3] ?? '').replace(/\s+/g, ' ').trim();
    if (!company || !position) continue;
    if (/university|bachelor|certificate|toeic|project/i.test(`${company} ${position}`)) continue;
    const key = `${time}|${company}|${position}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(
      workExperienceItemSchema.parse({
        company_name: company.slice(0, 120),
        position: position.slice(0, 120),
        time: time.slice(0, 80),
      }),
    );
    if (out.length >= 8) break;
  }
  return out;
}

function pickEducation(text: string): EducationItem[] {
  const out: EducationItem[] = [];
  const uni =
    text.match(
      /([^\n]{0,80}(?:University|Institute|College|Đại học)[^\n]{0,60})/i,
    )?.[1]?.trim() ?? '';
  const degreeMajor = text.match(
    /\b(Bachelor[^\n]{0,80}|Master[^\n]{0,80}|Cử nhân[^\n]{0,80}|Kỹ sư[^\n]{0,80})/i,
  )?.[1]?.trim();
  if (uni || degreeMajor) {
    let degree = degreeMajor ?? '';
    let major = '';
    const split = degreeMajor?.match(/^(.*?),\s*(.+)$/);
    if (split) {
      degree = split[1]!.trim();
      major = split[2]!.trim();
    }
    out.push(
      educationItemSchema.parse({
        school_name: uni || 'Cơ sở giáo dục',
        degree: degree || undefined,
        major: major || undefined,
      }),
    );
  }
  return out;
}

function pickSkills(text: string): SkillItem[] {
  const found = new Map<string, SkillItem>();
  for (const cat of SKILL_CATS) {
    cat.re.lastIndex = 0;
    for (const m of text.matchAll(cat.re)) {
      const name = m[0]!.replace(/\s+/g, ' ').trim();
      const key = name.toLowerCase();
      if (found.has(key)) continue;
      found.set(
        key,
        skillItemSchema.parse({
          name,
          category: cat.category,
          level: cat.level,
          level_label: cat.level >= 75 ? 'Thành thạo' : 'Khá',
        }),
      );
      if (found.size >= 16) break;
    }
    if (found.size >= 16) break;
  }
  return [...found.values()];
}

function pickCertsAndLangs(text: string): CertificatesLanguages {
  const certificates: { name: string; organization?: string }[] = [];
  const languages: { name: string; proficiency?: string }[] = [];
  const toeic =
    text.match(/TOEIC[\s\S]{0,80}?Score:\s*(\d{3,4})/i) ??
    text.match(/TOEIC[^\n]{0,40}?(\d{3,4})/i);
  if (toeic?.[1]) {
    certificates.push({ name: `TOEIC ${toeic[1]}`, organization: 'ETS' });
    languages.push({ name: 'English', proficiency: `TOEIC ${toeic[1]}` });
  } else if (/\bTOEIC\b/i.test(text)) {
    certificates.push({ name: 'TOEIC', organization: 'ETS' });
  }
  return certificatesLanguagesSchema.parse({ certificates, languages });
}

export interface HeuristicCvExtract {
  basic_info: BasicInfo;
  education: EducationItem[];
  work_experience: WorkExperienceItem[];
  skills: SkillItem[];
  certificates_languages: CertificatesLanguages;
}

/** heuristicExtractCv builds structured CV fields from raw text when LLM returns empty/partial data. */
export function heuristicExtractCv(rawText: string): HeuristicCvExtract {
  const text = (rawText || '').trim();
  return {
    basic_info: basicInfoSchema.parse({
      name: pickPersonName(text),
      email: pickEmail(text),
      phone: pickPhone(text),
      gender: 2,
      address: /HCM|Ho Chi Minh|Hà Nội|Ha Noi|Hanoi/i.test(text) ? 'Việt Nam' : '',
      date_of_birth: '',
    }),
    education: pickEducation(text),
    work_experience: pickWork(text),
    skills: pickSkills(text),
    certificates_languages: pickCertsAndLangs(text),
  };
}

/** mergeStructuredCv fills empty LLM arrays/fields from heuristic extract. */
export function mergeStructuredCv(
  primary: HeuristicCvExtract,
  fallback: HeuristicCvExtract,
): HeuristicCvExtract {
  const nameLooksBad =
    !primary.basic_info.name ||
    looksLikeJobOrPeriod(primary.basic_info.name) ||
    primary.basic_info.name === 'Ứng viên';

  return {
    basic_info: basicInfoSchema.parse({
      name: nameLooksBad ? fallback.basic_info.name : primary.basic_info.name,
      email: primary.basic_info.email || fallback.basic_info.email,
      phone: primary.basic_info.phone || fallback.basic_info.phone,
      gender: primary.basic_info.gender ?? fallback.basic_info.gender,
      address: primary.basic_info.address || fallback.basic_info.address,
      date_of_birth: primary.basic_info.date_of_birth || fallback.basic_info.date_of_birth,
    }),
    education: primary.education.length > 0 ? primary.education : fallback.education,
    work_experience:
      primary.work_experience.length > 0 ? primary.work_experience : fallback.work_experience,
    skills: primary.skills.length > 0 ? primary.skills : fallback.skills,
    certificates_languages:
      (primary.certificates_languages.certificates?.length ?? 0) > 0 ||
      (primary.certificates_languages.languages?.length ?? 0) > 0
        ? primary.certificates_languages
        : fallback.certificates_languages,
  };
}
