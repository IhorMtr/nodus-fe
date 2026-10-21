import { type NextRequest, NextResponse } from 'next/server';

import { authCookie } from '../_lib/auth-cookie';

export const runtime = 'nodejs';

export function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: true,
      data: { hasRefreshCookie: Boolean(authCookie.read(request)) },
      messageType: null,
      errors: null,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
