import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Config } from '../config.js';
import { registerAdviceRoutes } from '../modules/advice/routes.js';
import { AdviceService } from '../modules/advice/service.js';
import { registerCvRoutes } from '../modules/cv/routes.js';
import { registerCvWorker } from '../modules/cv/worker.js';
import { registerSystemRoutes } from '../modules/system/routes.js';
import { registerUserRoutes } from '../modules/users/routes.js';
import type { Auth, AuthVars } from './auth.js';
import type { Repos } from './composition.js';
import { HttpError } from './errors.js';
import type { TextExtractor } from './extract.js';
import type { Analyzer } from './llm.js';
import type { JobQueue } from './queue.js';
import type { FileStorage } from './storage.js';

const PREFIX = '/api';

/** Deps for domain route modules (repos from composition root). */
export interface RouteCtx {
  cfg: Config;
  auth: Auth;
  repos: Repos;
  storage: FileStorage;
  queue: JobQueue;
}

export interface AppDeps extends RouteCtx {
  analyzer: Analyzer;
  extractor: TextExtractor;
}

export function buildApp(deps: AppDeps): Hono<{ Variables: AuthVars }> {
  const advice = new AdviceService(deps.repos.advice, deps.repos.users);
  registerCvWorker({
    queue: deps.queue,
    repo: deps.repos.cv,
    storage: deps.storage,
    extractor: deps.extractor,
    analyzer: deps.analyzer,
    onAnalysisComplete: async ({ fileId, userId, analysisId, report }) => {
      if (!userId) return;
      await advice.recordSnapshot({
        userId,
        fileId,
        analysisId,
        report,
      });
    },
  });

  const app = new Hono<{ Variables: AuthVars }>();

  app.use(
    '*',
    cors({
      origin: (origin) => origin || '*',
      allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );

  registerSystemRoutes(app, PREFIX);
  registerUserRoutes(app, PREFIX, deps);
  registerCvRoutes(app, PREFIX, deps);
  registerAdviceRoutes(app, PREFIX, deps);

  app.notFound((c) => c.json({ error_code: 404, message: 'Not found', data: null }, 404));

  app.onError((err, c) => {
    if (err instanceof HttpError) {
      return c.json({ error_code: err.errorCode, message: err.message, data: null }, err.status as 400);
    }
    console.error(err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error_code: 500, message, data: null }, 500);
  });

  return app;
}
