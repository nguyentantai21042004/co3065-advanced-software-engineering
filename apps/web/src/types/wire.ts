/** Client-side wire shapes (types only — Zod lives in apps/api/src/contracts). */

export type ApiEnvelope<T = unknown> = {
  error_code: number;
  message: string;
  data?: T | null;
};

export type AuthData = {
  token: string;
  email: string;
};

export type UploadedFileWire = {
  file_id: string;
  original_file_name: string;
  content_type: string;
  file_size: number;
  uploaded_at: string;
};

export type CvStatus = 'uploaded' | 'processing' | 'completed';

export type CvListItemWire = UploadedFileWire & {
  status: CvStatus;
};

export type CoachingReportWire = {
  domain_inference: {
    domain: string;
    job_titles: string[];
    summary: string;
  };
  format_critique: {
    summary: string;
    findings: string[];
  };
  experience_comments: {
    summary: string;
    strengths: string[];
    gaps: string[];
  };
  recommendations: string[];
};

export type BasicInfo = {
  name: string;
  email: string;
  phone: string;
  gender?: number | string;
  address: string;
  date_of_birth: string;
};

export type EducationItem = {
  school_name?: string;
  school?: string;
  degree?: string;
  major?: string;
  graduation_date?: string;
};

export type WorkExperienceItem = {
  company_name?: string;
  company?: string;
  position?: string;
  title?: string;
  time?: string;
};

export type SkillItem = {
  name?: string;
  category?: string;
  level?: number;
  level_label?: string;
};

export type CertificatesLanguages = {
  certificates: Array<{ name?: string; organization?: string; date?: string }>;
  languages: Array<{ name?: string; proficiency?: string }>;
};

export type CvDataWire = {
  file_id: string;
  extraction_result_id: string;
  analysis_result_id?: string | null;
  raw_text?: string | null;
  avatar_id?: string | null;
  basic_info?: BasicInfo | null;
  education?: EducationItem[] | null;
  work_experience?: WorkExperienceItem[] | null;
  skills?: SkillItem[] | null;
  certificates_languages?: CertificatesLanguages | null;
  analysis_result?: {
    basic_info: BasicInfo;
    education: EducationItem[];
    work_experience: WorkExperienceItem[];
    skills: SkillItem[];
    certificates_languages: CertificatesLanguages;
    coaching_report: CoachingReportWire;
    extract_quality?: 'ok' | 'low';
  } | null;
  coaching_report?: CoachingReportWire | null;
  extraction_completed_at?: string | null;
  analysis_completed_at?: string | null;
};

export type AdviceSection =
  | 'domain_inference'
  | 'format_critique'
  | 'experience_comments'
  | 'recommendations'
  | 'custom';

export type AdvicePinStatus = 'todo' | 'doing' | 'done' | 'archived';

export type AdviceSnapshotWire = {
  id: string;
  user_id: string;
  file_id: string;
  file_name?: string;
  analysis_id: string;
  created_at: string;
  domain: string;
  summary: string;
  report: CoachingReportWire;
  fingerprint: string;
};

export type AdviceSnapshotListWire = {
  items: AdviceSnapshotWire[];
};

export type AdvicePinWire = {
  id: string;
  user_id: string;
  source_snapshot_id?: string | null;
  file_id?: string | null;
  section: AdviceSection;
  body: string;
  status: AdvicePinStatus;
  created_at: string;
  updated_at: string;
};

export type AdviceDiffWire = {
  left: {
    id: string;
    created_at: string;
    file_id: string;
    file_name?: string;
    domain: string;
    summary: string;
  };
  right: {
    id: string;
    created_at: string;
    file_id: string;
    file_name?: string;
    domain: string;
    summary: string;
  };
  changes: {
    domain_changed: boolean;
    domain?: { from: string; to: string };
    recommendations: { added: string[]; removed: string[]; unchanged: string[] };
    format_findings: { added: string[]; removed: string[] };
    experience: {
      strengths_added: string[];
      strengths_removed: string[];
      gaps_added: string[];
      gaps_removed: string[];
    };
  };
};
