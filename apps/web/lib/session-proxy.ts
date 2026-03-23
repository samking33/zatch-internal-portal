import { NextResponse, type NextRequest } from 'next/server';

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  LoginResponseData,
  RefreshResponseData,
} from '@zatch/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const REFRESH_COOKIE = 'refreshToken';
const SESSION_COOKIE = 'zatch_portal_session';
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

const parseJson = async <T>(response: Response): Promise<T> => response.json() as Promise<T>;

const isProduction = process.env.NODE_ENV === 'production';

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SEVEN_DAYS_SECONDS,
};

const sessionCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SEVEN_DAYS_SECONDS,
};

const extractRefreshToken = (setCookieHeader: string | null): string | null => {
  if (!setCookieHeader) {
    return null;
  }

  const match = setCookieHeader.match(/refreshToken=([^;]+)/);
  return match?.[1] ?? null;
};

export const createSessionLoginResponse = async (request: NextRequest): Promise<NextResponse> => {
  const body = (await request.json()) as { email?: string; password?: string };

  const upstream = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await parseJson<ApiSuccessResponse<LoginResponseData> | ApiErrorResponse>(upstream);

  if (!upstream.ok || !payload.success) {
    return NextResponse.json(payload, { status: upstream.status });
  }

  const refreshToken = extractRefreshToken(upstream.headers.get('set-cookie'));

  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing refresh token',
      } satisfies ApiErrorResponse,
      { status: 500 },
    );
  }

  const response = NextResponse.json(payload, { status: upstream.status });
  response.cookies.set(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  response.cookies.set(SESSION_COOKIE, '1', sessionCookieOptions);
  return response;
};

export const createSessionRefreshResponse = async (request: NextRequest): Promise<NextResponse> => {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
      } satisfies ApiErrorResponse,
      { status: 401 },
    );
  }

  const upstream = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      cookie: `${REFRESH_COOKIE}=${refreshToken}`,
    },
    cache: 'no-store',
  });

  const payload = await parseJson<ApiSuccessResponse<RefreshResponseData> | ApiErrorResponse>(upstream);
  return NextResponse.json(payload, { status: upstream.status });
};

export const createSessionLogoutResponse = async (request: NextRequest): Promise<NextResponse> => {
  const authorization = request.headers.get('authorization');
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const headers = new Headers();

  if (authorization) {
    headers.set('authorization', authorization);
  }

  if (refreshToken) {
    headers.set('cookie', `${REFRESH_COOKIE}=${refreshToken}`);
  }

  const upstream = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers,
    cache: 'no-store',
  });

  const payload = await parseJson<ApiSuccessResponse<{ message: string }> | ApiErrorResponse>(upstream);
  const response = NextResponse.json(payload, { status: upstream.status });
  response.cookies.delete(REFRESH_COOKIE);
  response.cookies.delete(SESSION_COOKIE);
  return response;
};
