/**
 * Cliente HTTP para a API do backend Patrimônio.
 * Base URL: VITE_API_URL ou http://localhost:3000
 * JWT: Authorization Bearer; refresh automático em 401.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setApiToken(token: string | null) {
  accessToken = token;
}

export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

async function refreshToken(): Promise<string | null> {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) return null;
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  accessToken = data.accessToken;
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken;
}

export type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, skipRefresh, headers = {}, ...init } = options;
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const doRequest = (token: string | null) => {
    const h: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (token && !skipAuth) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    return fetch(url, { ...init, headers: h });
  };

  let res = await doRequest(accessToken ?? undefined ?? null);

  if (res.status === 401 && !skipAuth && !skipRefresh) {
    const newToken = await refreshToken();
    if (newToken) {
      res = await doRequest(newToken);
    } else {
      localStorage.removeItem('refreshToken');
      setApiToken(null);
      onUnauthorized?.();
      throw new Error('Sessão expirada');
    }
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) message = j.message;
    } catch {
      // use text
    }
    throw new Error(message || `Erro ${res.status}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) return res.json() as Promise<T>;
  return undefined as T;
}

export const apiGet = <T>(path: string, options?: RequestOptions) =>
  api<T>(path, { ...options, method: 'GET' });
export const apiPost = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  api<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const apiPatch = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  api<T>(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
export const apiDelete = (path: string, options?: RequestOptions) =>
  api<void>(path, { ...options, method: 'DELETE' });
