import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

export interface Config {
  port: number;
  jwtSecret: string;
  dataDir: string;
  databaseUrl?: string;
  geminiApiKeys: string[];
  s3?: S3Config;
}

function csv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Load process env into a typed config. Defaults keep the local demo bootable. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const dataDir = env.DATA_DIR ?? join(process.cwd(), '.data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  const s3Endpoint = env.S3_ENDPOINT;
  const s3 =
    s3Endpoint && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_BUCKET
      ? {
          endpoint: s3Endpoint,
          accessKeyId: env.S3_ACCESS_KEY_ID,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY,
          bucket: env.S3_BUCKET,
          region: env.S3_REGION ?? 'auto',
        }
      : undefined;

  return {
    port: Number(env.PORT ?? 8090),
    jwtSecret: env.JWT_SECRET ?? 'dev-insecure-jwt-secret',
    dataDir,
    databaseUrl: env.DATABASE_URL || undefined,
    geminiApiKeys: csv(env.GEMINI_API_KEYS),
    s3,
  };
}
