import type { Sql } from '../../platform/db.js';

export interface UserRow {
  id: string;
  email: string;
  password: string;
}

export class UserRepo {
  constructor(private readonly db: Sql) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const rows = await this.db.query<UserRow>('SELECT id, email, password FROM users WHERE email = $1 LIMIT 1', [
      email,
    ]);
    return rows[0] ?? null;
  }

  async insert(row: UserRow): Promise<UserRow> {
    const rows = await this.db.query<UserRow>(
      'INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING id, email, password',
      [row.id, row.email, row.password],
    );
    const created = rows[0];
    if (!created) throw new Error('failed to insert user');
    return created;
  }
}
