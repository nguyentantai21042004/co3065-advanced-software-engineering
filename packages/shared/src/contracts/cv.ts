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

/** CV payload from GET /api/cv/data/{file_id}. Nested analysis fields are JSON objects. */
export const cvDataSchema = z.object({
  file_id: z.string().uuid(),
  extraction_result_id: z.string().uuid(),
  analysis_result_id: z.string().uuid().nullable().optional(),
  raw_text: z.string().nullable().optional(),
  avatar_id: z.string().uuid().nullable().optional(),
  basic_info: z.unknown().nullable().optional(),
  education: z.unknown().nullable().optional(),
  work_experience: z.unknown().nullable().optional(),
  skills: z.unknown().nullable().optional(),
  certificates_languages: z.unknown().nullable().optional(),
  analysis_result: z.unknown().nullable().optional(),
  extraction_completed_at: z.string().nullable().optional(),
  analysis_completed_at: z.string().nullable().optional(),
});

export type CvDataWire = z.infer<typeof cvDataSchema>;

export const supportedTypes = ['PDF', 'DOCX', 'DOC'] as const;
