import { z } from 'zod';

export const snapshotIdParamsSchema = z.object({
  id: z.string().uuid('Invalid snapshot id'),
});

export const pinIdParamsSchema = z.object({
  id: z.string().uuid('Invalid pin id'),
});

export const adviceDiffQuerySchema = z.object({
  left_id: z.string().uuid().optional(),
  right_id: z.string().uuid().optional(),
});

export const adviceListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
  before: z.string().min(1).optional(),
});
