import { z } from 'zod';
import { coachingReportSchema } from './cv.js';

export const adviceSectionSchema = z.enum([
  'domain_inference',
  'format_critique',
  'experience_comments',
  'recommendations',
  'custom',
]);

export type AdviceSection = z.infer<typeof adviceSectionSchema>;

export const advicePinStatusSchema = z.enum(['todo', 'doing', 'done', 'archived']);

export type AdvicePinStatus = z.infer<typeof advicePinStatusSchema>;

export const adviceSnapshotSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  file_id: z.string().uuid(),
  file_name: z.string().optional(),
  analysis_id: z.string().uuid(),
  created_at: z.string(),
  domain: z.string(),
  summary: z.string(),
  report: coachingReportSchema,
  fingerprint: z.string(),
});

export type AdviceSnapshotWire = z.infer<typeof adviceSnapshotSchema>;

export const adviceSnapshotListSchema = z.object({
  items: z.array(adviceSnapshotSchema),
});

export type AdviceSnapshotListWire = z.infer<typeof adviceSnapshotListSchema>;

export const advicePinSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  source_snapshot_id: z.string().uuid().nullable().optional(),
  file_id: z.string().uuid().nullable().optional(),
  section: adviceSectionSchema,
  body: z.string().min(1),
  status: advicePinStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type AdvicePinWire = z.infer<typeof advicePinSchema>;

export const createAdvicePinBodySchema = z.object({
  body: z.string().min(1),
  section: adviceSectionSchema.default('recommendations'),
  source_snapshot_id: z.string().uuid().optional(),
  file_id: z.string().uuid().optional(),
  status: advicePinStatusSchema.optional(),
});

export type CreateAdvicePinBody = z.infer<typeof createAdvicePinBodySchema>;

export const patchAdvicePinBodySchema = z.object({
  body: z.string().min(1).optional(),
  status: advicePinStatusSchema.optional(),
});

export type PatchAdvicePinBody = z.infer<typeof patchAdvicePinBodySchema>;

export const adviceDiffSideSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  file_id: z.string().uuid(),
  file_name: z.string().optional(),
  domain: z.string(),
  summary: z.string(),
});

export const adviceDiffSchema = z.object({
  left: adviceDiffSideSchema,
  right: adviceDiffSideSchema,
  changes: z.object({
    domain_changed: z.boolean(),
    domain: z.object({ from: z.string(), to: z.string() }).optional(),
    recommendations: z.object({
      added: z.array(z.string()),
      removed: z.array(z.string()),
      unchanged: z.array(z.string()),
    }),
    format_findings: z.object({
      added: z.array(z.string()),
      removed: z.array(z.string()),
    }),
    experience: z.object({
      strengths_added: z.array(z.string()),
      strengths_removed: z.array(z.string()),
      gaps_added: z.array(z.string()),
      gaps_removed: z.array(z.string()),
    }),
  }),
});

export type AdviceDiffWire = z.infer<typeof adviceDiffSchema>;
