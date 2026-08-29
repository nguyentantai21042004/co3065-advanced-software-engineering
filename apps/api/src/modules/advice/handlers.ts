import {
  createAdvicePinBodySchema,
  patchAdvicePinBodySchema,
} from '@aicoach/shared/contracts/advice';
import type { AppContext } from '../../platform/auth.js';
import type { RouteCtx } from '../../platform/http.js';
import { ok } from '../../platform/response.js';
import { validateBody, validateParams, validateQuery } from '../../platform/validate.js';
import {
  adviceDiffQuerySchema,
  adviceListQuerySchema,
  pinIdParamsSchema,
  snapshotIdParamsSchema,
} from './contract.js';
import { AdviceService } from './service.js';

export function adviceHandlers(ctx: RouteCtx) {
  const service = new AdviceService(ctx.repos.advice, ctx.repos.users);

  return {
    listSnapshots: async (c: AppContext) => {
      const q = validateQuery(c, adviceListQuerySchema);
      const data = await service.listSnapshots(c.get('email'), q.limit, q.before);
      return ok(c, 'Success', data);
    },
    getSnapshot: async (c: AppContext) => {
      const { id } = validateParams(c, snapshotIdParamsSchema);
      const data = await service.getSnapshot(c.get('email'), id);
      return ok(c, 'Success', data);
    },
    diff: async (c: AppContext) => {
      const q = validateQuery(c, adviceDiffQuerySchema);
      const data = await service.diff(c.get('email'), q.left_id, q.right_id);
      return ok(c, 'Success', data);
    },
    listPins: async (c: AppContext) => {
      const data = await service.listPins(c.get('email'));
      return ok(c, 'Success', data);
    },
    createPin: async (c: AppContext) => {
      const body = await validateBody(c, createAdvicePinBodySchema);
      const data = await service.createPin(c.get('email'), body);
      return ok(c, 'Pinned', data, 201);
    },
    patchPin: async (c: AppContext) => {
      const { id } = validateParams(c, pinIdParamsSchema);
      const body = await validateBody(c, patchAdvicePinBodySchema);
      const data = await service.patchPin(c.get('email'), id, body);
      return ok(c, 'Updated', data);
    },
    deletePin: async (c: AppContext) => {
      const { id } = validateParams(c, pinIdParamsSchema);
      await service.deletePin(c.get('email'), id);
      return ok(c, 'Deleted', null);
    },
  };
}
