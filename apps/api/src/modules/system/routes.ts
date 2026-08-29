import type { Hono } from 'hono';
import type { AuthVars } from '../../platform/auth.js';
import { ok } from '../../platform/response.js';

export function registerSystemRoutes(app: Hono<{ Variables: AuthVars }>, prefix: string): void {
  app.get(`${prefix}/health`, (c) => ok(c, 'OK', { ok: true as const }));
}
