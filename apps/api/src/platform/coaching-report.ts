import type {
  BasicInfo,
  CertificatesLanguages,
  CoachingReportWire,
  EducationItem,
  SkillItem,
  WorkExperienceItem,
} from '../contracts/cv.js';

export interface StructuredCvHints {
  basic_info?: Partial<BasicInfo>;
  education?: EducationItem[];
  work_experience?: WorkExperienceItem[];
  skills?: SkillItem[];
  certificates_languages?: CertificatesLanguages;
}

const DOMAIN_KEYWORDS: { domain: string; titles: string[]; needles: RegExp }[] = [
  {
    domain: 'Kỹ thuật phần mềm',
    titles: ['Software Engineer', 'Backend Engineer', 'Full-stack Developer'],
    needles:
      /\b(typescript|javascript|java|golang|go\b|python|react|node\.?js|spring|kubernetes|microservice|api|golang|rust)\b/i,
  },
  {
    domain: 'Dữ liệu / Phân tích',
    titles: ['Data Analyst', 'Data Engineer', 'ML Engineer'],
    needles: /\b(sql|pandas|spark|etl|machine learning|data science|tableau|warehouse)\b/i,
  },
  {
    domain: 'Sản phẩm / Thiết kế',
    titles: ['Product Manager', 'UX Designer', 'Product Designer'],
    needles: /\b(product manager|figma|user research|wireframe|roadmap|ux|ui design)\b/i,
  },
  {
    domain: 'Vận hành / Kinh doanh',
    titles: ['Operations Specialist', 'Business Analyst', 'Project Coordinator'],
    needles: /\b(operations|business analyst|stakeholder|kpi|process improvement|excel)\b/i,
  },
];

function asWorkList(value: WorkExperienceItem[] | undefined): WorkExperienceItem[] {
  return value ?? [];
}

function asSkillList(value: SkillItem[] | undefined): SkillItem[] {
  return value ?? [];
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
        summary: `Dựa trên kỹ năng và nội dung CV, hướng phù hợp nhất là ${row.domain}. Nên nhắm các vị trí như ${row.titles.join(', ')}.`,
      };
    }
  }
  const titleHint = asWorkList(hints.work_experience)[0];
  const position = (titleHint?.position ?? titleHint?.title ?? '').trim();
  if (position) {
    return {
      domain: 'Chuyên môn tổng quát',
      job_titles: [position],
      summary: `CV đang nghiêng về các vai trò gần với "${position}". Bổ sung từ khóa domain để nhà tuyển dụng phân loại nhanh hơn.`,
    };
  }
  return {
    domain: 'Chuyên môn tổng quát',
    job_titles: ['Individual Contributor', 'Specialist'],
    summary:
      'Tín hiệu domain còn mỏng. Thêm 1 đoạn tóm tắt nghề nghiệp và 5–8 từ khóa vai trò để làm rõ hướng ứng tuyển.',
  };
}

function critiqueFormat(rawText: string, hints: StructuredCvHints): CoachingReportWire['format_critique'] {
  const findings: string[] = [];
  const lines = lineCount(rawText);
  if (lines < 8) {
    findings.push('Nội dung CV quá ngắn; hãy tách rõ các mục Tóm tắt, Kinh nghiệm, Học vấn, Kỹ năng.');
  }
  if (!hasEmail(rawText) && !(hints.basic_info?.email ?? '')) {
    findings.push('Chưa thấy email ở phần đầu — nhà tuyển dụng cần cách liên hệ rõ ràng.');
  }
  if (!hasPhone(rawText) && !(hints.basic_info?.phone ?? '')) {
    findings.push('Thiếu số điện thoại; với thị trường Việt Nam nên để lại (có thể ghi khu vực).');
  }
  if (!/(experience|work|employment|education|skills|projects|kinh nghiệm|học vấn|kỹ năng|dự án)/i.test(rawText)) {
    findings.push('Tiêu đề mục chưa rõ; dùng heading nhất quán để ATS và người đọc scan nhanh.');
  }
  if (rawText.length > 6_000) {
    findings.push('CV hơi dài cho màn hình đầu; nên rút gọn vai trò cũ, giữ trang 1 tập trung.');
  }
  if (asWorkList(hints.work_experience).length === 0 && !/\b(20\d{2}|19\d{2})\b/.test(rawText)) {
    findings.push('Mốc thời gian yếu; thêm năm bắt đầu–kết thúc cạnh mỗi vai trò.');
  }
  if (findings.length === 0) {
    findings.push('Bố cục đã đọc được; giữ heading thống nhất và ưu tiên bullet thành tựu hơn đoạn dài.');
  }
  return {
    summary:
      findings.length >= 3
        ? 'Định dạng cần chỉnh trước khi gửi ATS hoặc nhà tuyển dụng.'
        : 'Định dạng ổn, còn vài điểm nên polish.',
    findings,
  };
}

function commentExperience(
  rawText: string,
  hints: StructuredCvHints,
): CoachingReportWire['experience_comments'] {
  const roles = asWorkList(hints.work_experience);
  const skills = asSkillList(hints.skills);
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (roles.length > 0) {
    strengths.push(`Đã nhận diện ${roles.length} mục kinh nghiệm làm việc từ CV.`);
  } else if (/\b(engineer|developer|analyst|manager|intern|kỹ sư|lập trình)\b/i.test(rawText)) {
    strengths.push('Có chức danh nghề nghiệp trong văn bản dù phần kinh nghiệm cấu trúc còn mỏng.');
  } else {
    gaps.push('Ít lịch sử công việc cụ thể — hãy thêm 2–3 vai trò kèm phạm vi và tác động.');
  }

  if (/\b(\d+%|increased|reduced|led|owned|shipped|launched|giảm|tăng|phụ trách|triển khai)\b/i.test(rawText)) {
    strengths.push('Có ngôn ngữ thành tựu / tác động (số liệu hoặc động từ ownership).');
  } else {
    gaps.push('Thành tựu còn chung chung; viết lại bullet theo công thức hành động + bối cảnh + kết quả đo được.');
  }

  if (skills.length > 0 || /\b(skills?|technologies|kỹ năng|công nghệ)\b/i.test(rawText)) {
    strengths.push('Đã đề cập kỹ năng; nên nhóm theo ngôn ngữ / công cụ / soft skills.');
  } else {
    gaps.push('Danh sách kỹ năng mỏng — nêu rõ công cụ đã dùng ở các vai trò gần đây.');
  }

  if (strengths.length === 0) {
    strengths.push('Đã có đủ nguyên liệu thô để xây narrative mạnh hơn sau khi chỉnh sửa.');
  }
  if (gaps.length === 0) {
    gaps.push('Đào sâu một dự án chủ lực để reviewer hiểu đóng góp nổi bật nhất.');
  }

  return {
    summary:
      roles.length > 0
        ? 'Kinh nghiệm đã có, nên nhấn mạnh kết quả hơn là liệt kê nhiệm vụ.'
        : 'Phần kinh nghiệm cần thêm vai trò và kết quả cụ thể.',
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
    `Viết 2–3 câu tóm tắt nghề nghiệp nhắm tới ${domain.job_titles[0] ?? domain.domain}.`,
    'Mỗi vai trò gần đây: 3–5 bullet gồm động từ hành động, phạm vi, và số liệu nếu có.',
    `Ghép từ khóa từ JD ${domain.domain} vào mục kỹ năng và tóm tắt (chỉ những gì đúng thật).`,
  ];
  if (format.findings[0]) out.push(`Chỉnh format: ${format.findings[0]}`);
  if (experience.gaps[0]) out.push(`Chỉnh kinh nghiệm: ${experience.gaps[0]}`);
  out.push('Xuất báo cáo coaching (PDF/Word), chỉnh theo checklist rồi mới nộp hồ sơ.');
  return out.slice(0, 6);
}

/**
 * buildCoachingReport turns raw CV text plus structured extract hints into the four
 * coaching sections (tiếng Việt) used by the API wire and PDF/Word exporters.
 */
export function buildCoachingReport(rawText: string, hints: StructuredCvHints = {}): CoachingReportWire {
  const text = (rawText || '').trim() || 'CV trống';
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
