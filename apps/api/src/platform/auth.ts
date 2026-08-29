import type { Context, MiddlewareHandler } from 'hono';
import { SignJWT, jwtVerify } from 'jose';
import type { Config } from '../config.js';
import { unauthenticated } from './errors.js';

export type AuthVars = { email: string };
export type AppContext = Context<{ Variables: AuthVars }>;

const ALG = 'HS256';
const TOKEN_TTL = '24h';

/** JWT signer/verifier. Subject is the user email. */
export class Auth {
  private readonly secret: Uint8Array;

  constructor(cfg: Config) {
    this.secret = new TextEncoder().encode(cfg.jwtSecret);
  }

  async sign(email: string): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: ALG })
      .setSubject(email)
      .setIssuedAt()
      .setExpirationTime(TOKEN_TTL)
      .sign(this.secret);
  }

  async verify(token: string): Promise<string> {
    const { payload } = await jwtVerify(token, this.secret);
    if (!payload.sub) throw unauthenticated('invalid token');
    return payload.sub;
  }

  protect: MiddlewareHandler<{ Variables: AuthVars }> = async (c, next) => {
    const header = c.req.header('authorization') ?? '';
    const raw = header.replace(/^Bearer\s+/i, '').trim();
    if (!raw) throw unauthenticated('missing bearer token');
    try {
      c.set('email', await this.verify(raw));
    } catch {
      throw unauthenticated('invalid token');
    }
    await next();
  };
}
