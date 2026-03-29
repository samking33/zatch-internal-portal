'use client';

import type { ApiErrorResponse, ApiSuccessResponse } from '@zatch/shared';

import {
  getApiErrorMessage,
  parseJsonResponse,
  type SessionLoginData,
} from './admin-api';

const SESSION_PROXY_URL = '';
const ADMIN_PROXY_URL = '/api/admin';

type ApiClientInit = RequestInit & {
  requireAuth?: boolean;
};

const normalizeAdminProxyPath = (path: string): string => {
  const trimmedPath = path.trim();

  if (!trimmedPath) {
    return '';
  }

  const [pathname = '', search = ''] = trimmedPath.split('?');
  const normalizedPathname = pathname
    .replace(/^\/?api\/v1\/admin\/?/i, '')
    .replace(/^\/+/, '');

  const resolvedPath = normalizedPathname ? `/${normalizedPathname}` : '';

  return search ? `${resolvedPath}?${search}` : resolvedPath;
};

export const apiClient = async <T = unknown>(
  path: string,
  init: ApiClientInit = {},
): Promise<ApiSuccessResponse<T>> => {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${ADMIN_PROXY_URL}${normalizeAdminProxyPath(path)}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  const payload = await parseJsonResponse(response);

  if (!response.ok || payload.success === false) {
    throw new Error(getApiErrorMessage(payload, 'Request failed'));
  }

  return {
    success: true,
    data: payload as T,
  };
};

export const loginWithPassword = async (
  phone: string,
  countryCode: string,
  password: string,
): Promise<SessionLoginData> => {
  const response = await fetch(`${SESSION_PROXY_URL}/api/session/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ phone, countryCode, password }),
  });

  const payload = (await response.json()) as ApiSuccessResponse<SessionLoginData> | ApiErrorResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? 'Login failed' : payload.error);
  }

  return payload.data;
};
