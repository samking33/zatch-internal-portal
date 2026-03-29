import { type NextRequest, NextResponse } from 'next/server';

import { canAccessPortal, getAdminApiUrl } from '../../../../lib/admin-api';
import { getServerSession } from '../../../../lib/server-fetch';

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const jsonError = (message: string, status: number): NextResponse =>
  NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );

const proxyRequest = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
  const session = await getServerSession();

  if (!session || !canAccessPortal(session.user)) {
    return jsonError('Unauthorized', 401);
  }

  const { path } = await context.params;

  if (!Array.isArray(path) || path.length === 0) {
    return jsonError('Not found', 404);
  }

  const headers = new Headers();
  headers.set('Authorization', `Bearer ${session.accessToken}`);

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  const upstreamUrl = `${getAdminApiUrl()}/api/v1/admin/${path.join('/')}${request.nextUrl.search}`;
  const method = request.method.toUpperCase();
  const hasBody = !['GET', 'HEAD'].includes(method);
  const body = hasBody ? await request.text() : undefined;
  const upstreamInit: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  };

  if (hasBody && body) {
    upstreamInit.body = body;
  }

  let upstream: Response;

  try {
    upstream = await fetch(upstreamUrl, upstreamInit);
  } catch {
    return jsonError('Upstream request failed', 502);
  }

  const responseText = await upstream.text();

  return new NextResponse(responseText || null, {
    status: upstream.status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
    },
  });
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
