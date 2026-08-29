import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

export type LlmProvider = 'stub' | 'pollinations' | 'gemini';

export interface Config {
  port: number;
  jwtSecret: string;
  dataDir: string;
  /** Required Neon/Postgres URL — no PGlite fallback at runtime. */
  databaseUrl: string;
  /** Required S3/R2 config — no local disk fallback at runtime. */
  s3: S3Config;
  geminiApiKeys: string[];
  llmProvider: LlmProvider;
  pollinationsUrl: string;
  pollinationsModel: string;
}

function csv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function requireEnv(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(
      `Missing required env ${key}. Set it in .env / apps/api/.env.local (see .env.example).`,
    );
  }
  return value;
}

/** Load process env. DATABASE_URL + S3_* are mandatory for API boot. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const dataDir = env.DATA_DIR ?? join(process.cwd(), '.data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  const databaseUrl = requireEnv(env, 'DATABASE_URL');
  const s3: S3Config = {
    endpoint: requireEnv(env, 'S3_ENDPOINT'),
    accessKeyId: requireEnv(env, 'S3_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv(env, 'S3_SECRET_ACCESS_KEY'),
    bucket: requireEnv(env, 'S3_BUCKET'),
    region: (env.S3_REGION ?? 'auto').trim() || 'auto',
  };

  const geminiApiKeys = csv(env.GEMINI_API_KEYS);
  const rawProvider = (env.LLM_PROVIDER ?? '').trim().toLowerCase();
  const llmProvider: LlmProvider =
    rawProvider === 'stub' || rawProvider === 'gemini' || rawProvider === 'pollinations'
      ? rawProvider
      : geminiApiKeys.length > 0
        ? 'gemini'
        : 'pollinations';

  return {
    port: Number(env.PORT ?? 8090),
    jwtSecret: env.JWT_SECRET ?? 'dev-insecure-jwt-secret',
    dataDir,
    databaseUrl,
    s3,
    geminiApiKeys,
    llmProvider,
    pollinationsUrl: env.POLLINATIONS_URL ?? 'https://text.pollinations.ai/openai',
    pollinationsModel: env.POLLINATIONS_MODEL ?? 'openai',
  };
}
