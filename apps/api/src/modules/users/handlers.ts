import { ok } from '../../platform/response.js';
import { validateBody } from '../../platform/validate.js';
import type { AppContext } from '../../platform/auth.js';
import type { RouteCtx } from '../../platform/http.js';
import { loginBodySchema, registerBodySchema } from './contract.js';
import { UserService } from './service.js';

export function userHandlers(ctx: RouteCtx) {
  const service = new UserService(ctx.repos.users, ctx.auth);

  return {
    register: async (c: AppContext) => {
      const body = await validateBody(c, registerBodySchema);
      const data = await service.register(body);
      return ok(c, 'User registered successfully', data);
    },
    login: async (c: AppContext) => {
      const body = await validateBody(c, loginBodySchema);
      const data = await service.login(body);
      return ok(c, 'Login successful', data);
    },
  };
}
