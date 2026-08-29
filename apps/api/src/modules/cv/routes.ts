import type { Hono } from 'hono';
import type { AuthVars } from '../../platform/auth.js';
import type { RouteCtx } from '../../platform/http.js';
import { cvHandlers } from './handlers.js';

export function registerCvRoutes(
  app: Hono<{ Variables: AuthVars }>,
  prefix: string,
  ctx: RouteCtx,
): void {
  const handlers = cvHandlers(ctx);

  app.get(`${prefix}/cv/supported-types`, handlers.supportedTypes);
  app.post(`${prefix}/cv/upload`, ctx.auth.protect, handlers.upload);
  app.post(`${prefix}/cv/extract/:file_id`, ctx.auth.protect, handlers.extract);
  app.get(`${prefix}/cv/data/:file_id`, ctx.auth.protect, handlers.getData);
  app.get(`${prefix}/cv/list`, ctx.auth.protect, handlers.list);
  app.get(`${prefix}/cv/export/:file_id/pdf`, ctx.auth.protect, handlers.exportPdf);
  app.get(`${prefix}/cv/export/:file_id/docx`, ctx.auth.protect, handlers.exportDocx);
}
