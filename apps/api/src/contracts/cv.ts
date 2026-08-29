import { z } from 'zod';

export const uploadedFileSchema = z.object({
  file_id: z.string().uuid(),
  original_file_name: z.string(),
  content_type: z.string(),
  file_size: z.number(),
  uploaded_at: z.string(),
});

export type UploadedFileWire = z.infer<typeof uploadedFileSchema>;

export const cvStatusSchema = z.enum(['uploaded', 'processing', 'completed']);

export const cvListItemSchema = uploadedFileSchema.extend({
  status: cvStatusSchema,
});

export type CvListItemWire = z.infer<typeof cvListItemSchema>;

/** Structured fields extracted from a CV (API + LLM share this shape). */
export const basicInfoSchema = z.object({
  name: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  gender: z.union([z.number(), z.string()]).optional(),
  address: z.string().default(''),
  date_of_birth: z.string().default(''),
});

export type BasicInfo = z.infer<typeof basicInfoSchema>;

export const educationItemSchema = z.object({
  school_name: z.string().optional(),
  school: z.string().optional(),
  degree: z.string().optional(),
  major: z.string().optional(),
  graduation_date: z.string().optional(),
});

export type EducationItem = z.infer<typeof educationItemSchema>;

export const workExperienceItemSchema = z.object({
  company_name: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  title: z.string().optional(),
  time: z.string().optional(),
});

export type WorkExperienceItem = z.infer<typeof workExperienceItemSchema>;

export const skillItemSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  level: z.number().optional(),
  level_label: z.string().optional(),
});

export type SkillItem = z.infer<typeof skillItemSchema>;

export const certificatesLanguagesSchema = z.object({
  certificates: z
    .array(
      z.object({
        name: z.string().optional(),
        organization: z.string().optional(),
        date: z.string().optional(),
      }),
    )
    .default([]),
  languages: z
    .array(
      z.object({
        name: z.string().optional(),
        proficiency: z.string().optional(),
      }),
    )
    .default([]),
});

export type CertificatesLanguages = z.infer<typeof certificatesLanguagesSchema>;

/** Coaching report sections produced after extract/analyze (not the original CV). */
export const coachingReportSchema = z.object({
  domain_inference: z.object({
    domain: z.string().min(1),
    job_titles: z.array(z.string()).min(1),
    summary: z.string().min(1),
  }),
  format_critique: z.object({
    summary: z.string().min(1),
    findings: z.array(z.string()).min(1),
  }),
  experience_comments: z.object({
    summary: z.string().min(1),
    strengths: z.array(z.string()).min(1),
    gaps: z.array(z.string()).min(1),
  }),
  recommendations: z.array(z.string()).min(1),
});

export type CoachingReportWire = z.infer<typeof coachingReportSchema>;

export const extractQualitySchema = z.enum(['ok', 'low']);

export type ExtractQuality = z.infer<typeof extractQualitySchema>;

/** Full analysis blob stored in cv_analysis_result / returned to clients. */
export const cvAnalysisSchema = z.object({
  basic_info: basicInfoSchema,
  education: z.array(educationItemSchema),
  work_experience: z.array(workExperienceItemSchema),
  skills: z.array(skillItemSchema),
  certificates_languages: certificatesLanguagesSchema,
  coaching_report: coachingReportSchema,
  extract_quality: extractQualitySchema.optional(),
});

export type CvAnalysis = z.infer<typeof cvAnalysisSchema>;

/** Gemini one-shot JSON response (same fields; coaching_report may be missing → fallback builder). */
export const geminiCvResponseSchema = z.object({
  basic_info: basicInfoSchema.partial().optional(),
  education: z.array(educationItemSchema).optional(),
  work_experience: z.array(workExperienceItemSchema).optional(),
  skills: z.array(skillItemSchema).optional(),
  certificates_languages: certificatesLanguagesSchema.partial().optional(),
  coaching_report: coachingReportSchema.optional(),
});

export type GeminiCvResponse = z.infer<typeof geminiCvResponseSchema>;

/** CV payload from GET /api/cv/data/{file_id}. */
export const cvDataSchema = z.object({
  file_id: z.string().uuid(),
  extraction_result_id: z.string().uuid(),
  analysis_result_id: z.string().uuid().nullable().optional(),
  raw_text: z.string().nullable().optional(),
  avatar_id: z.string().uuid().nullable().optional(),
  basic_info: basicInfoSchema.nullable().optional(),
  education: z.array(educationItemSchema).nullable().optional(),
  work_experience: z.array(workExperienceItemSchema).nullable().optional(),
  skills: z.array(skillItemSchema).nullable().optional(),
  certificates_languages: certificatesLanguagesSchema.nullable().optional(),
  analysis_result: cvAnalysisSchema.partial().nullable().optional(),
  coaching_report: coachingReportSchema.nullable().optional(),
  extraction_completed_at: z.string().nullable().optional(),
  analysis_completed_at: z.string().nullable().optional(),
});

export type CvDataWire = z.infer<typeof cvDataSchema>;

export const supportedTypes = ['PDF', 'DOCX', 'DOC'] as const;
