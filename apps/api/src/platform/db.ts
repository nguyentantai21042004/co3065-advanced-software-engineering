import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import type { Config } from '../config.js';

export interface Sql {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  exec(text: string): Promise<void>;
  close(): Promise<void>;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name TEXT,
    locale TEXT DEFAULT 'vi'
);

CREATE TABLE IF NOT EXISTS uploaded_file (
    file_id UUID PRIMARY KEY,
    user_id UUID NULL REFERENCES users(id),
    original_file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(255) NOT NULL,
    content_type VARCHAR(128) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_uploaded_file_user_id ON uploaded_file(user_id);

CREATE TABLE IF NOT EXISTS extraction_result (
    id UUID PRIMARY KEY,
    file_id UUID NOT NULL REFERENCES uploaded_file(file_id),
    raw_text TEXT,
    avatar_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_extraction_file_id ON extraction_result(file_id);

CREATE TABLE IF NOT EXISTS cv_analysis_result (
    id UUID PRIMARY KEY,
    extraction_result_id UUID NOT NULL REFERENCES extraction_result(id),
    file_id UUID NOT NULL REFERENCES uploaded_file(file_id),
    basic_info JSONB,
    education JSONB,
    work_experience JSONB,
    skills JSONB,
    certificates_languages JSONB,
    analysis_result JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_cv_analysis_extraction_result_id ON cv_analysis_result(extraction_result_id);
CREATE INDEX IF NOT EXISTS idx_cv_analysis_file_id ON cv_analysis_result(file_id);

CREATE TABLE IF NOT EXISTS advice_snapshot (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    file_id UUID NOT NULL REFERENCES uploaded_file(file_id),
    analysis_id UUID NOT NULL REFERENCES cv_analysis_result(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    domain TEXT NOT NULL,
    summary TEXT NOT NULL,
    report JSONB NOT NULL,
    fingerprint TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_advice_snapshot_user_created
  ON advice_snapshot(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_advice_snapshot_user_file_created
  ON advice_snapshot(user_id, file_id, created_at DESC);

CREATE TABLE IF NOT EXISTS advice_pin (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    source_snapshot_id UUID NULL REFERENCES advice_snapshot(id),
    file_id UUID NULL REFERENCES uploaded_file(file_id),
    section TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_advice_pin_user_created
  ON advice_pin(user_id, created_at DESC);
`;

const ALTER_SQL = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'vi';
`;

function wrapPglite(db: PGlite): Sql {
  return {
    async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
      const result = await db.query<T>(text, params);
      return result.rows;
    },
    async exec(text: string): Promise<void> {
      await db.exec(text);
    },
    async close(): Promise<void> {
      await db.close();
    },
  };
}

function wrapPg(pool: pg.Pool): Sql {
  return {
    async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
      const result = await pool.query(text, params);
      return result.rows as T[];
    },
    async exec(text: string): Promise<void> {
      await pool.query(text);
    },
    async close(): Promise<void> {
      await pool.end();
    },
  };
}

export interface OpenDatabaseOpts {
  databaseUrl?: string;
  dataDir: string;
  inMemory?: boolean;
}

/** Open PGlite (default) or a real Postgres when DATABASE_URL is set. */
export async function openDatabase(opts: OpenDatabaseOpts): Promise<Sql> {
  if (opts.databaseUrl) {
    const pool = new pg.Pool({ connectionString: opts.databaseUrl });
    return wrapPg(pool);
  }

  if (opts.inMemory) {
    const db = new PGlite();
    await db.waitReady;
    return wrapPglite(db);
  }

  const dir = join(opts.dataDir, 'pglite');
  await mkdir(dir, { recursive: true });
  const db = new PGlite(dir);
  await db.waitReady;
  return wrapPglite(db);
}

/** Open the configured Postgres/Neon database (runtime — no PGlite fallback). */
export async function openDatabaseFromConfig(cfg: Config): Promise<Sql> {
  return openDatabase({ databaseUrl: cfg.databaseUrl, dataDir: cfg.dataDir });
}

export async function migrate(db: Sql): Promise<void> {
  await db.exec(SCHEMA_SQL);
  await db.exec(ALTER_SQL);
}
