import { cookies } from 'next/headers';

import type { ApiSuccessResponse } from '@zatch/shared';

import {
  ADMIN_SESSION_TOKEN_COOKIE,
  ADMIN_SESSION_USER_COOKIE,
  type AdminSessionUser,
  getAdminApiUrl,
  getApiErrorMessage,
  parseJsonResponse,
} from './admin-api';
import { parseSessionUserCookie } from './session-cookie';

const isRetriableFetchError = (error: unknown): boolean => {
  const message = error instanceof Error ? `${error.message} ${(error as { cause?: unknown }).cause ?? ''}` : String(error);

  return (
    message.includes('fetch failed') ||
    message.includes('ECONNRESET') ||
    message.includes('ETIMEDOUT') ||
    message.includes('ERR_SSL_') ||
    message.includes('bad record mac')
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getServerSession = async (): Promise<{
  accessToken: string;
  user: AdminSessionUser;
} | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_SESSION_TOKEN_COOKIE)?.value;
  const user = await parseSessionUserCookie(cookieStore.get(ADMIN_SESSION_USER_COOKIE)?.value);

  if (!accessToken || !user) {
    return null;
  }

  return {
    accessToken,
    user,
  };
};

export const serverFetch = async <T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ApiSuccessResponse<T>> => {
  const session = await getServerSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${session.accessToken}`);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response | null = null;
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(`${getAdminApiUrl()}${path}`, {
        ...init,
        cache: 'no-store',
        headers,
      });
      break;
    } catch (error) {
      lastError = error;

      if (attempt === 2 || !isRetriableFetchError(error)) {
        throw error;
      }

      await sleep(200 * (attempt + 1));
    }
  }

  if (!response) {
    throw (lastError instanceof Error ? lastError : new Error('Request failed'));
  }

  const payload = await parseJsonResponse(response);

  if (!response.ok || payload.success === false) {
    throw new Error(getApiErrorMessage(payload, 'Request failed'));
  }

  return {
    success: true,
    data: payload as T,
  };
};
