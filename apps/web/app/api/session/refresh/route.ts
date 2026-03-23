import { type NextRequest, NextResponse } from 'next/server';

import { createSessionRefreshResponse } from '../../../../lib/session-proxy';

export const POST = async (request: NextRequest): Promise<NextResponse> =>
  createSessionRefreshResponse(request);
