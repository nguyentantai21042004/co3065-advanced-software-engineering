import { z } from 'zod';

export const authBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type AuthBody = z.infer<typeof authBodySchema>;

export const authDataSchema = z.object({
  token: z.string(),
  email: z.string().email(),
});

export type AuthData = z.infer<typeof authDataSchema>;
