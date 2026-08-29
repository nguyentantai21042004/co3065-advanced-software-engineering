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
      /\b(typescript|javascript|java|golang|go\b|python|react|node\.?js|spring|kubernetes|microservice|api|rust)\b/i,
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

function hasImpactLanguage(text: string): boolean {
  return /\b(\d+%|\d+\+|increased|reduced|led|owned|shipped|launched|giảm|tăng|phụ trách|triển khai|delivered|scalable)\b/i.test(
    text,
  );
}

function detectProjects(rawText: string): string[] {
  const names: string[] = [];
  for (const match of rawText.matchAll(/\b(SMAP|KANBAN)\b/gi)) {
    const name = match[1]!.toUpperCase();
    if (!names.includes(name)) names.push(name);
  }
  return names.slice(0, 3);
}

function inferDomain(rawText: string, hints: StructuredCvHints): CoachingReportWire['domain_inference'] {
  const blob = `${rawText}\n${JSON.stringify(hints.skills ?? {})}\n${JSON.stringify(hints.work_experience ?? {})}`;
  for (const row of DOMAIN_KEYWORDS) {
    if (row.needles.test(blob)) {
      const roleHint = asWorkList(hints.work_experience)[0]?.position;
      return {
        domain: row.domain,
        job_titles: row.titles,
        summary: roleHint
          ? `Hồ sơ đang kể câu chuyện ${row.domain}, gần với vai trò "${roleHint}". Nên định vị rõ hơn sang ${row.titles[0]} / ${row.titles[1]} bằng tóm tắt nghề nghiệp và 3 bullet thành tựu mạnh nhất.`
          : `Dựa trên kỹ năng và nội dung CV, hướng phù hợp nhất là ${row.domain}. Nên nhắm ${row.titles.join(', ')} và viết narrative quanh stack đã chứng minh được.`,
      };
    }
  }
  const titleHint = asWorkList(hints.work_experience)[0];
  const position = (titleHint?.position ?? titleHint?.title ?? '').trim();
  if (position) {
    return {
      domain: 'Chuyên môn tổng quát',
      job_titles: [position],
      summary: `CV đang nghiêng về vai trò "${position}". Thêm đoạn định vị 2–3 câu và từ khóa domain để nhà tuyển dụng hiểu hướng ứng tuyển trong 10 giây đầu.`,
    };
  }
  return {
    domain: 'Chuyên môn tổng quát',
    job_titles: ['Individual Contributor', 'Specialist'],
    summary:
      'Tín hiệu domain còn mỏng. Viết 1 đoạn tóm tắt nghề nghiệp + 5–8 từ khóa vai trò để làm rõ hướng ứng tuyển trước khi nộp.',
  };
}

function critiqueFormat(rawText: string, hints: StructuredCvHints): CoachingReportWire['format_critique'] {
  const findings: string[] = [];
  if (lineCount(rawText) < 8) {
    findings.push('Nội dung CV quá ngắn; tách rõ các mục Tóm tắt, Kinh nghiệm, Học vấn, Kỹ năng.');
  }
  if (!hasEmail(rawText) && !(hints.basic_info?.email ?? '')) {
    findings.push('Thiếu email ở phần đầu — bổ sung cách liên hệ rõ ràng.');
  }
  if (!hasPhone(rawText) && !(hints.basic_info?.phone ?? '')) {
    findings.push('Thiếu số điện thoại; với thị trường Việt Nam nên để lại (có thể kèm khu vực).');
  }
  if (!/(experience|work|education|skills|projects|kinh nghiệm|học vấn|kỹ năng|dự án)/i.test(rawText)) {
    findings.push('Heading mục chưa rõ; dùng tiêu đề nhất quán để ATS và người đọc scan nhanh.');
  }
  if (rawText.length > 6_000) {
    findings.push('CV hơi dài ở màn hình đầu; rút gọn vai trò cũ, giữ trang 1 tập trung vào 2–3 điểm mạnh.');
  }
  if (asWorkList(hints.work_experience).length === 0 && !/\b(20\d{2}|19\d{2})\b/.test(rawText)) {
    findings.push('Mốc thời gian yếu; thêm năm bắt đầu–kết thúc cạnh mỗi vai trò.');
  }
  if (findings.length === 0) {
    findings.push('Bố cục đọc được; ưu tiên bullet thành tựu đo được hơn đoạn mô tả nhiệm vụ dài.');
  }
  return {
    summary:
      findings.length >= 3
        ? 'Định dạng còn vài điểm cản ATS — chỉnh sau khi đã làm giàu nội dung.'
        : 'Định dạng ổn; chỉ cần polish nhẹ sau khi nội dung đã chắc.',
    findings: findings.slice(0, 4),
  };
}

function commentExperience(
  rawText: string,
  hints: StructuredCvHints,
): CoachingReportWire['experience_comments'] {
  const roles = asWorkList(hints.work_experience);
  const skills = asSkillList(hints.skills);
  const projects = detectProjects(rawText);
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (roles.length > 0) {
    const top = roles
      .slice(0, 2)
      .map((role) => `${role.position ?? 'Vai trò'} @ ${role.company_name ?? 'công ty'}`)
      .join('; ');
    strengths.push(`Đã có ${roles.length} mục kinh nghiệm có thể kể lại được (${top}).`);
  } else if (/\b(engineer|developer|analyst|manager|intern|kỹ sư|lập trình)\b/i.test(rawText)) {
    strengths.push('Có chức danh nghề nghiệp trong văn bản — cần kéo chúng thành mục kinh nghiệm có mốc thời gian.');
  } else {
    gaps.push('Thiếu lịch sử công việc cụ thể — thêm 2–3 vai trò kèm phạm vi hệ thống và trách nhiệm sở hữu.');
  }

  if (hasImpactLanguage(rawText)) {
    strengths.push(
      'Đã xuất hiện ngôn ngữ tác động (số liệu / ownership / delivered). Hãy nhân rộng công thức này cho mọi bullet chính.',
    );
  } else {
    gaps.push(
      'Bullet còn mô tả nhiệm vụ nhiều hơn kết quả. Viết lại theo: hành động → phạm vi hệ thống/người dùng → kết quả đo được (%, thời gian, quy mô).',
    );
  }

  if (projects.length > 0) {
    strengths.push(
      `Có tín hiệu dự án nổi bật (${projects.join(', ')}) — đây là nguyên liệu narrative tốt nếu được viết như case study ngắn.`,
    );
    gaps.push(
      `Với ${projects[0]}: thêm 3 bullet “vấn đề → kiến trúc/giải pháp → kết quả” thay vì chỉ liệt kê tech stack.`,
    );
  } else {
    gaps.push('Chưa thấy case study dự án chủ lực. Chọn 1 hệ thống bạn sở hữu nhiều nhất và viết sâu 4–6 dòng.');
  }

  if (skills.length >= 4) {
    const sample = skills
      .slice(0, 4)
      .map((skill) => skill.name)
      .filter(Boolean)
      .join(', ');
    strengths.push(`Stack kỹ thuật đủ dày (${sample}${skills.length > 4 ? ', …' : ''}) để chứng minh fit backend/cloud.`);
    gaps.push('Gắn mỗi nhóm kỹ năng với 1 bằng chứng trong kinh nghiệm/dự án (tránh skill list “treo” không ngữ cảnh).');
  } else if (skills.length > 0 || /\b(skills?|technologies|kỹ năng|công nghệ)\b/i.test(rawText)) {
    strengths.push('Đã đề cập kỹ năng; nên nhóm Backend / DevOps / Cloud và gắn với vai trò gần nhất.');
  } else {
    gaps.push('Danh sách kỹ năng mỏng — nêu rõ công cụ đã dùng ở các vai trò gần đây và mức độ (production vs familiar).');
  }

  if (strengths.length === 0) {
    strengths.push('Đã có đủ nguyên liệu thô để xây narrative mạnh hơn sau khi chọn 1–2 thành tựu chủ lực.');
  }
  if (gaps.length === 0) {
    gaps.push('Đào sâu một dự án chủ lực để reviewer hiểu đóng góp cá nhân, không chỉ tech stack dùng chung team.');
  }

  return {
    summary:
      roles.length > 0
        ? 'Nội dung kinh nghiệm đã có khung; cần nâng từ “làm gì” sang “tạo tác động gì” và chọn 1–2 câu chuyện chủ lực.'
        : 'Phần kinh nghiệm còn mỏng về vai trò cụ thể — ưu tiên bổ sung nội dung trước khi chỉnh format.',
    strengths: strengths.slice(0, 4),
    gaps: gaps.slice(0, 4),
  };
}

function buildRecommendations(
  domain: CoachingReportWire['domain_inference'],
  format: CoachingReportWire['format_critique'],
  experience: CoachingReportWire['experience_comments'],
  hints: StructuredCvHints,
  rawText: string,
): string[] {
  const roles = asWorkList(hints.work_experience);
  const skills = asSkillList(hints.skills);
  const projects = detectProjects(rawText);
  const topRole = roles[0];
  const topTitle = domain.job_titles[0] ?? domain.domain;
  const out: string[] = [];

  out.push(
    `Viết Professional Summary 3 câu nhắm ${topTitle}: (1) vị trí hiện tại/mục tiêu, (2) stack đã chứng minh, (3) thành tựu định lượng nổi bật nhất.`,
  );

  if (topRole?.position || topRole?.company_name) {
    out.push(
      `Với vai trò ${topRole.position ?? 'gần nhất'}${topRole.company_name ? ` tại ${topRole.company_name}` : ''}: chọn 3–5 bullet mạnh theo mẫu hành động + phạm vi hệ thống + kết quả (latency, throughput, số user, thời gian giao).`,
    );
  } else {
    out.push(
      'Thêm 2 vai trò gần nhất kèm mốc thời gian và 3 bullet thành tựu/ownership cho mỗi vai trò — đừng để trống phần kinh nghiệm có cấu trúc.',
    );
  }

  if (projects[0]) {
    out.push(
      `Tách ${projects[0]} thành mục Projects dạng case study: vấn đề nghiệp vụ → kiến trúc (service/queue/DB) → đóng góp cá nhân → kết quả hoặc demo/link.`,
    );
  } else {
    out.push(
      'Chọn 1 dự án chủ lực và viết case study ngắn (vấn đề → giải pháp → kết quả). Đây là phần recruiter nhớ nhất sau chức danh.',
    );
  }

  if (skills.length > 0) {
    out.push(
      `Nhóm kỹ năng theo Backend / DevOps / Cloud và chỉ giữ những gì có bằng chứng trong bullet (ví dụ ${
        skills
          .slice(0, 3)
          .map((skill) => skill.name)
          .filter(Boolean)
          .join(', ') || 'stack chính'
      }).`,
    );
  } else {
    out.push(
      `Liệt kê 8–12 kỹ năng cốt lõi của ${domain.domain}, mỗi nhóm kèm 1 bằng chứng trong kinh nghiệm thay vì chỉ tên công cụ.`,
    );
  }

  if (experience.gaps[0]) out.push(experience.gaps[0]);

  if (format.findings[0] && !/bố cục đã đọc được|Bố cục đọc được/i.test(format.findings[0])) {
    out.push(`Sau khi nội dung ổn: ${format.findings[0]}`);
  }

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
  const recommendations = buildRecommendations(
    domain_inference,
    format_critique,
    experience_comments,
    hints,
    text,
  );
  return {
    domain_inference,
    format_critique,
    experience_comments,
    recommendations,
  };
}
