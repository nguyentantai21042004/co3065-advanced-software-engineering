import type { Hono } from 'hono';
import type { AuthVars } from '../../platform/auth.js';
import type { RouteCtx } from '../../platform/http.js';
import { adviceHandlers } from './handlers.js';

export function registerAdviceRoutes(
  app: Hono<{ Variables: AuthVars }>,
  prefix: string,
  ctx: RouteCtx,
): void {
  const handlers = adviceHandlers(ctx);

  app.get(`${prefix}/advice/snapshots`, ctx.auth.protect, handlers.listSnapshots);
  app.get(`${prefix}/advice/snapshots/:id`, ctx.auth.protect, handlers.getSnapshot);
  app.get(`${prefix}/advice/diff`, ctx.auth.protect, handlers.diff);
  app.get(`${prefix}/advice/pins`, ctx.auth.protect, handlers.listPins);
  app.post(`${prefix}/advice/pins`, ctx.auth.protect, handlers.createPin);
  app.patch(`${prefix}/advice/pins/:id`, ctx.auth.protect, handlers.patchPin);
  app.delete(`${prefix}/advice/pins/:id`, ctx.auth.protect, handlers.deletePin);
}
