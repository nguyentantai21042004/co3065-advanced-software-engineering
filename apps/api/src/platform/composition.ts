import { UserRepo } from '../modules/users/repo.js';
import { CvRepo } from '../modules/cv/repo.js';
import type { Sql } from './db.js';

/** Repos constructed once at boot. Modules take deps from ctx — never construct foreign repos. */
export interface Repos {
  users: UserRepo;
  cv: CvRepo;
}

export function makeRepos(db: Sql): Repos {
  return {
    users: new UserRepo(db),
    cv: new CvRepo(db),
  };
}
