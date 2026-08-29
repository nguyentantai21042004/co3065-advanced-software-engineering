import type { Hono } from 'hono';
import type { AuthVars } from '../../platform/auth.js';
import type { RouteCtx } from '../../platform/http.js';
import { userHandlers } from './handlers.js';

export function registerUserRoutes(
  app: Hono<{ Variables: AuthVars }>,
  prefix: string,
  ctx: RouteCtx,
): void {
  const handlers = userHandlers(ctx);
  app.post(`${prefix}/users/register`, handlers.register);
  app.post(`${prefix}/users/login`, handlers.login);
}
