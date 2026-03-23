import { type NextRequest, NextResponse } from 'next/server';

import { createSessionLoginResponse } from '../../../../lib/session-proxy';

export const POST = async (request: NextRequest): Promise<NextResponse> =>
  createSessionLoginResponse(request);
