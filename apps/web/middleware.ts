import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/sellers', '/audit', '/admin-users'];

export const middleware = (request: NextRequest): NextResponse => {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSessionCookie =
    request.cookies.has('refreshToken') || request.cookies.has('zatch_portal_session');

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirectTo', pathname);
  return NextResponse.redirect(loginUrl);
};

export const config = {
  matcher: ['/dashboard/:path*', '/sellers/:path*', '/audit/:path*', '/admin-users/:path*'],
};
