import { NextResponse, type NextRequest } from 'next/server';

import type { ApiErrorResponse, ApiSuccessResponse } from '@zatch/shared';

import {
  ADMIN_SESSION_MAX_AGE,
  ADMIN_SESSION_TOKEN_COOKIE,
  ADMIN_SESSION_USER_COOKIE,
  canAccessPortal,
  getAdminApiUrl,
  getApiErrorMessage,
  normalizeLoginPayload,
  parseJsonResponse,
  type SessionLoginData,
} from './admin-api';
import { parseSessionUserCookie, serializeSessionUserCookie } from './session-cookie';

const isProduction = process.env.NODE_ENV === 'production';

const sessionCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: ADMIN_SESSION_MAX_AGE,
  priority: 'high' as const,
};

const applyNoStore = (response: NextResponse): NextResponse => {
  response.headers.set('Cache-Control', 'no-store');
  return response;
};

const clearSessionCookies = (response: NextResponse): NextResponse => {
  response.cookies.set(ADMIN_SESSION_TOKEN_COOKIE, '', {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  response.cookies.set(ADMIN_SESSION_USER_COOKIE, '', {
    ...sessionCookieOptions,
    maxAge: 0,
  });

  return response;
};

export const createSessionLoginResponse = async (request: NextRequest): Promise<NextResponse> => {
  const body = (await request.json()) as {
    phone?: string;
    countryCode?: string;
    password?: string;
  };

  const upstream = await fetch(`${getAdminApiUrl()}/api/v1/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await parseJsonResponse(upstream);

  if (!upstream.ok || payload.success === false) {
    return applyNoStore(
      NextResponse.json(
        {
          success: false,
          error: getApiErrorMessage(payload, 'Login failed'),
        } satisfies ApiErrorResponse,
        { status: upstream.status || 500 },
      ),
    );
  }

  const normalized = normalizeLoginPayload(payload);

  if (!normalized.accessToken || !normalized.user.id) {
    return applyNoStore(
      NextResponse.json(
        {
          success: false,
          error: 'Login response was missing session details',
        } satisfies ApiErrorResponse,
        { status: 500 },
      ),
    );
  }

  if (!canAccessPortal(normalized.user)) {
    return applyNoStore(
      NextResponse.json(
        {
          success: false,
          error: 'This account does not have portal access',
        } satisfies ApiErrorResponse,
        { status: 403 },
      ),
    );
  }

  const response = applyNoStore(
    NextResponse.json(
      {
        success: true,
        data: {
          user: normalized.user,
        },
      } satisfies ApiSuccessResponse<SessionLoginData>,
      { status: 200 },
    ),
  );

  response.cookies.set(ADMIN_SESSION_TOKEN_COOKIE, normalized.accessToken, sessionCookieOptions);
  response.cookies.set(
    ADMIN_SESSION_USER_COOKIE,
    await serializeSessionUserCookie(normalized.user),
    sessionCookieOptions,
  );

  return response;
};

export const createSessionRefreshResponse = async (request: NextRequest): Promise<NextResponse> => {
  const accessToken = request.cookies.get(ADMIN_SESSION_TOKEN_COOKIE)?.value;
  const encodedUser = request.cookies.get(ADMIN_SESSION_USER_COOKIE)?.value;

  if (!accessToken || !encodedUser) {
    return clearSessionCookies(
      applyNoStore(
        NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          } satisfies ApiErrorResponse,
          { status: 401 },
        ),
      ),
    );
  }

  const user = await parseSessionUserCookie(encodedUser);

  if (!user) {
    return clearSessionCookies(
      applyNoStore(
        NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          } satisfies ApiErrorResponse,
          { status: 401 },
        ),
      ),
    );
  }

  return applyNoStore(
    NextResponse.json(
      {
        success: true,
        data: {
          user,
        },
      } satisfies ApiSuccessResponse<SessionLoginData>,
      { status: 200 },
    ),
  );
};

export const createSessionLogoutResponse = async (): Promise<NextResponse> => {
  return clearSessionCookies(
    applyNoStore(
      NextResponse.json(
        {
          success: true,
          data: {
            message: 'Logged out',
          },
        },
        { status: 200 },
      ),
    ),
  );
};
