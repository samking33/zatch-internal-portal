'use client';

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  LoginResponseData,
  RefreshResponseData,
} from '@zatch/shared';

import { authStore } from '../store/auth.store';

const SESSION_PROXY_URL = '';

const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    return apiUrl;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:4000';
  }

  throw new Error('NEXT_PUBLIC_API_URL is required in production');
};

type ApiClientInit = RequestInit & {
  requireAuth?: boolean;
  retryOnUnauthorized?: boolean;
};

const parseJson = async <T>(response: Response): Promise<T> => response.json() as Promise<T>;

const refreshAccessToken = async (): Promise<string | null> => {
  const response = await fetch(`${SESSION_PROXY_URL}/api/session/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    authStore.clearAccessToken();
    return null;
  }

  const payload = await parseJson<ApiSuccessResponse<RefreshResponseData> | ApiErrorResponse>(response);

  if (!payload.success) {
    authStore.clearAccessToken();
    return null;
  }

  authStore.setAccessToken(payload.data.accessToken);
  return payload.data.accessToken;
};

export const apiClient = async <T>(
  path: string,
  init: ApiClientInit = {},
): Promise<ApiSuccessResponse<T>> => {
  const apiUrl = getApiUrl();
  const headers = new Headers(init.headers);
  const requireAuth = init.requireAuth ?? true;

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (requireAuth) {
    const accessToken = authStore.getAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && (init.retryOnUnauthorized ?? true) && requireAuth) {
    const refreshedToken = await refreshAccessToken();

    if (!refreshedToken) {
      throw new Error('Session expired');
    }

    return apiClient<T>(path, {
      ...init,
      retryOnUnauthorized: false,
    });
  }

  const payload = await parseJson<ApiSuccessResponse<T> | ApiErrorResponse>(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? 'Request failed' : payload.error);
  }

  return payload;
};

export const loginWithPassword = async (email: string, password: string) => {
  const response = await fetch(`${SESSION_PROXY_URL}/api/session/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const payload = await parseJson<ApiSuccessResponse<LoginResponseData> | ApiErrorResponse>(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? 'Login failed' : payload.error);
  }

  authStore.setAccessToken(payload.data.accessToken);
  return payload.data;
};
