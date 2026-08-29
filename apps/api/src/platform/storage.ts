import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Config, S3Config } from '../config.js';
import { notFound, systemError } from './errors.js';

export interface FileStorage {
  put(path: string, bytes: Buffer, contentType: string): Promise<void>;
  get(path: string): Promise<Buffer>;
}

class LocalStorage implements FileStorage {
  constructor(private readonly root: string) {}

  async put(path: string, bytes: Buffer, _contentType: string): Promise<void> {
    const full = join(this.root, path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, bytes);
  }

  async get(path: string): Promise<Buffer> {
    try {
      return await readFile(join(this.root, path));
    } catch {
      throw notFound('File not found in storage');
    }
  }
}

class S3Storage implements FileStorage {
  private readonly client: S3Client;

  constructor(private readonly cfg: S3Config) {
    this.client = new S3Client({
      endpoint: cfg.endpoint,
      region: cfg.region,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async put(path: string, bytes: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.cfg.bucket,
        Key: path,
        Body: bytes,
        ContentType: contentType,
      }),
    );
  }

  async get(path: string): Promise<Buffer> {
    try {
      const out = await this.client.send(
        new GetObjectCommand({ Bucket: this.cfg.bucket, Key: path }),
      );
      const bytes = await out.Body?.transformToByteArray();
      if (!bytes) throw notFound('File not found in storage');
      return Buffer.from(bytes);
    } catch (err) {
      if (err instanceof Error && err.name === 'NoSuchKey') throw notFound('File not found in storage');
      if (err instanceof Error && err.name === 'HttpError') throw err;
      throw systemError('Failed to read file from storage');
    }
  }
}

export function createStorage(cfg: Config): FileStorage {
  if (cfg.s3) return new S3Storage(cfg.s3);
  return new LocalStorage(join(cfg.dataDir, 'files'));
}

export function createLocalStorage(root: string): FileStorage {
  return new LocalStorage(root);
}
