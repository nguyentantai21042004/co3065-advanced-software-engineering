import { supportedTypes } from '@aicoach/shared/contracts/cv';
import type { AppContext } from '../../platform/auth.js';
import type { RouteCtx } from '../../platform/http.js';
import { badRequest } from '../../platform/errors.js';
import { ok } from '../../platform/response.js';
import { validateParams } from '../../platform/validate.js';
import { fileIdParamsSchema } from './contract.js';
import { CvService } from './service.js';

async function readUpload(c: AppContext): Promise<{ fileName: string; contentType: string; size: number; bytes: Buffer }> {
  const body = await c.req.parseBody({ all: true });
  const file = body.file;
  if (!file || typeof file === 'string' || Array.isArray(file)) throw badRequest('File is required');
  const bytes = Buffer.from(await file.arrayBuffer());
  return {
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    size: file.size || bytes.length,
    bytes,
  };
}

export function cvHandlers(ctx: RouteCtx) {
  const service = new CvService(ctx.repos.cv, ctx.repos.users, ctx.storage, ctx.queue);

  return {
    upload: async (c: AppContext) => {
      const file = await readUpload(c);
      const data = await service.upload({ email: c.get('email'), ...file });
      return ok(c, 'File uploaded successfully', data, 201);
    },
    extract: async (c: AppContext) => {
      const { file_id } = validateParams(c, fileIdParamsSchema);
      await service.extract(file_id, c.get('email'));
      return ok(c, 'Task accepted', null);
    },
    supportedTypes: async (c: AppContext) => ok(c, 'Supported file types', [...supportedTypes]),
    getData: async (c: AppContext) => {
      const { file_id } = validateParams(c, fileIdParamsSchema);
      const data = await service.getData(file_id, c.get('email'));
      return ok(c, 'CV data retrieved successfully', data);
    },
    list: async (c: AppContext) => {
      const data = await service.list(c.get('email'));
      return ok(c, 'Success', data);
    },
  };
}
