export interface User {
  /** Base name for the persisted storageState file, e.g. "standard_user". */
  role: string;
  username: string;
  password: string;
}

function env(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

/**
 * The two stage-1 users. Credentials come exclusively from the environment
 * (local `.env` or GitHub Secrets) — never from committed code.
 * Usernames fall back to the public SauceDemo demo accounts; the password has
 * no fallback so a missing secret fails loudly instead of silently.
 */
export const USERS = {
  standard: {
    role: 'standard_user',
    username: env('SAUCEDEMO_USER_STANDARD', 'standard_user'),
    password: process.env.SAUCEDEMO_PASSWORD ?? '',
  },
  locked: {
    role: 'locked_out_user',
    username: env('SAUCEDEMO_USER_LOCKED', 'locked_out_user'),
    password: process.env.SAUCEDEMO_PASSWORD ?? '',
  },
} as const;

export type UserKey = keyof typeof USERS;
