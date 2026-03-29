import { type NextRequest, NextResponse } from 'next/server';

import { createSessionLogoutResponse } from '../../../../lib/session-proxy';

export const POST = async (_request: NextRequest): Promise<NextResponse> =>
  createSessionLogoutResponse();
