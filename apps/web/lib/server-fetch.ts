import { cookies } from 'next/headers';

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  IAdminUser,
  RefreshResponseData,
} from '@zatch/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const parseJson = async <T>(response: Response): Promise<T> => response.json() as Promise<T>;

const buildCookieHeader = (): string => cookies().getAll().map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');

export const refreshServerAccessToken = async (): Promise<string | null> => {
  const cookieHeader = buildCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const payload = await parseJson<ApiSuccessResponse<RefreshResponseData> | ApiErrorResponse>(response);

  if (!payload.success) {
    return null;
  }

  return payload.data.accessToken;
};

export const serverFetch = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiSuccessResponse<T>> => {
  const cookieHeader = buildCookieHeader();
  const accessToken = await refreshServerAccessToken();

  if (!accessToken) {
    throw new Error('Unauthorized');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
      cookie: cookieHeader,
    },
  });

  const payload = await parseJson<ApiSuccessResponse<T> | ApiErrorResponse>(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? 'Request failed' : payload.error);
  }

  return payload;
};

export const getServerSession = async (): Promise<{
  accessToken: string;
  user: IAdminUser;
} | null> => {
  const cookieHeader = buildCookieHeader();
  const accessToken = await refreshServerAccessToken();

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = await parseJson<ApiSuccessResponse<IAdminUser> | ApiErrorResponse>(response);

  if (!payload.success) {
    return null;
  }

  return {
    accessToken,
    user: payload.data,
  };
};
