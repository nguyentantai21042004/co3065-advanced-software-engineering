import { z } from 'zod';

export const fileIdParamsSchema = z.object({
  file_id: z.string().uuid('Invalid file_id format'),
});

export type FileIdParams = z.infer<typeof fileIdParamsSchema>;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'doc']);
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);
