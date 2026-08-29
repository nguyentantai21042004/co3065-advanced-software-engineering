import type { Context } from 'hono';
import type { ApiEnvelope } from '../contracts/api.js';

export type OkStatus = 200 | 201;

/** Wrap a payload in the legacy `{ error_code, message, data }` envelope. */
export function ok<T>(c: Context, message: string, data: T | null, status: OkStatus = 200) {
  const body: ApiEnvelope<T> = { error_code: 0, message, data };
  return c.json(body, status);
}
