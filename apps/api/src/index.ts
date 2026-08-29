import { serve } from '@hono/node-server';
import { loadConfig } from './config.js';
import { Auth } from './platform/auth.js';
import { makeRepos } from './platform/composition.js';
import { migrate, openDatabaseFromConfig } from './platform/db.js';
import { createExtractor } from './platform/extract.js';
import { buildApp } from './platform/http.js';
import { createAnalyzer } from './platform/llm.js';
import { createInProcessQueue } from './platform/queue.js';
import { createStorage } from './platform/storage.js';

async function main() {
  const cfg = loadConfig();
  const db = await openDatabaseFromConfig(cfg);
  await migrate(db);

  const repos = makeRepos(db);
  const app = buildApp({
    cfg,
    auth: new Auth(cfg),
    repos,
    storage: createStorage(cfg),
    queue: createInProcessQueue(),
    analyzer: createAnalyzer(cfg.geminiApiKeys),
    extractor: createExtractor(),
  });

  const server = serve({ fetch: app.fetch, port: cfg.port }, (info) => {
    const llm = cfg.geminiApiKeys.length > 0 ? 'gemini' : 'stub';
    const dbKind = cfg.databaseUrl ? 'postgres' : 'pglite';
    const files = cfg.s3 ? 's3' : 'local';
    console.log(`AI Coach API listening on http://localhost:${info.port} (db=${dbKind} storage=${files} llm=${llm})`);
  });

  const shutdown = async () => {
    server.close();
    await db.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
