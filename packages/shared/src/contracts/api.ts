import { z } from 'zod';

/** Wire envelope used by every HTTP response (legacy Jackson SNAKE_CASE). */
export const apiEnvelopeSchema = z.object({
  error_code: z.number(),
  message: z.string(),
  data: z.unknown().nullable().optional(),
});

export type ApiEnvelope<T = unknown> = {
  error_code: number;
  message: string;
  data?: T | null;
};

export const healthDataSchema = z.object({
  ok: z.literal(true),
});

export type HealthData = z.infer<typeof healthDataSchema>;
