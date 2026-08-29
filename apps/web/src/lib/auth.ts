import type { AuthData } from '@/types/wire';
import { api } from './api';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
const FILE_KEY = 'currentFile';

export type StoredUser = { email: string };

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function persist(data: AuthData) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify({ email: data.email }));
  document.cookie = `accessToken=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(FILE_KEY);
  document.cookie = 'accessToken=; path=/; max-age=0';
}

export async function login(email: string, password: string): Promise<AuthData> {
  const res = await api<AuthData>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  persist(res.data!);
  return res.data!;
}

export async function register(email: string, password: string): Promise<AuthData> {
  const res = await api<AuthData>('/users/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  persist(res.data!);
  return res.data!;
}

export function logout() {
  clearSession();
}

export type CurrentFile = {
  fileId: string;
  name: string;
  size: number;
  uploadedAt: string;
};

export function setCurrentFile(file: CurrentFile) {
  localStorage.setItem(FILE_KEY, JSON.stringify(file));
}

export function getCurrentFile(): CurrentFile | null {
  const raw = localStorage.getItem(FILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentFile;
  } catch {
    return null;
  }
}
