import type { ApiEnvelope } from '@/types/wire';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8090/api';

export class ApiError extends Error {
  constructor(
    public readonly errorCode: number,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function token(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers);
  const bearer = token();
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`);
  if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = (await res.json().catch(() => ({
    error_code: res.status,
    message: res.statusText,
    data: null,
  }))) as ApiEnvelope<T>;

  if (!res.ok || body.error_code !== 0) {
    throw new ApiError(body.error_code ?? res.status, body.message || res.statusText, res.status);
  }
  return body;
}
