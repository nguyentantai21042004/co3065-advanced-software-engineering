import type { Context } from 'hono';
import type { z } from 'zod';
import { badRequest } from './errors.js';

/** Parse JSON body; throws 400 on failure. */
export async function validateBody<S extends z.ZodTypeAny>(c: Context, schema: S): Promise<z.infer<S>> {
  const raw = await c.req.json().catch(() => null);
  const result = schema.safeParse(raw);
  if (!result.success) {
    const detail = result.error.issues.map((issue) => issue.message).join('; ');
    throw badRequest(detail || 'Invalid request body');
  }
  return result.data;
}

/** Path params are strings. */
export function validateParams<S extends z.ZodTypeAny>(c: Context, schema: S): z.infer<S> {
  const result = schema.safeParse(c.req.param());
  if (!result.success) {
    const detail = result.error.issues.map((issue) => issue.message).join('; ');
    throw badRequest(detail || 'Invalid path parameters');
  }
  return result.data;
}
