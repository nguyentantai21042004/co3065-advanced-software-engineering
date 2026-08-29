import { randomUUID } from 'node:crypto';
import type { AuthData } from '@aicoach/shared/contracts/auth';
import type { Auth } from '../../platform/auth.js';
import { badRequest, unauthenticated } from '../../platform/errors.js';
import { hashPassword, verifyPassword } from '../../platform/password.js';
import type { LoginBody, RegisterBody } from './contract.js';
import type { UserRepo } from './repo.js';

export class UserService {
  constructor(
    private readonly repo: UserRepo,
    private readonly auth: Auth,
  ) {}

  async register(body: RegisterBody): Promise<AuthData> {
    const email = body.email.trim().toLowerCase();
    const existing = await this.repo.findByEmail(email);
    if (existing) throw badRequest('Email already in use');

    await this.repo.insert({
      id: randomUUID(),
      email,
      password: await hashPassword(body.password),
    });

    return { token: await this.auth.sign(email), email };
  }

  async login(body: LoginBody): Promise<AuthData> {
    const email = body.email.trim().toLowerCase();
    const user = await this.repo.findByEmail(email);
    if (!user || !(await verifyPassword(body.password, user.password))) {
      throw unauthenticated('Invalid email or password');
    }
    return { token: await this.auth.sign(user.email), email: user.email };
  }

  async requireByEmail(email: string) {
    const user = await this.repo.findByEmail(email.trim().toLowerCase());
    if (!user) throw unauthenticated('user not found');
    return user;
  }
}
