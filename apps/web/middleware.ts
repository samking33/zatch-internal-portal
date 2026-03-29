import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  ADMIN_SESSION_TOKEN_COOKIE,
  ADMIN_SESSION_USER_COOKIE,
  canAccessPortal,
  canManageAdmins,
} from './lib/admin-api';
import { parseSessionUserCookie } from './lib/session-cookie';

const PROTECTED_PATHS = ['/dashboard', '/sellers', '/products', '/orders', '/settlements', '/admins'];

const redirectToLogin = (request: NextRequest): NextResponse => {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set(
    'redirectTo',
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(ADMIN_SESSION_TOKEN_COOKIE);
  response.cookies.delete(ADMIN_SESSION_USER_COOKIE);
  return response;
};

export const middleware = async (request: NextRequest): Promise<NextResponse> => {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!request.cookies.has(ADMIN_SESSION_TOKEN_COOKIE)) {
    return redirectToLogin(request);
  }

  const user = await parseSessionUserCookie(request.cookies.get(ADMIN_SESSION_USER_COOKIE)?.value);

  if (!user || !canAccessPortal(user)) {
    return redirectToLogin(request);
  }

  if (pathname.startsWith('/admins') && !canManageAdmins(user)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sellers/:path*',
    '/products/:path*',
    '/orders/:path*',
    '/settlements/:path*',
    '/admins/:path*',
  ],
};
