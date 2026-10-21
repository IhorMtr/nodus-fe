import 'server-only';

import { type NextRequest, type NextResponse } from 'next/server';

const COOKIE_NAME = 'nodus_refresh';
const REFRESH_TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

function cookieOptions(request: NextRequest) {
  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(
    request.nextUrl.hostname
  );

  return {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === 'production' ||
      request.nextUrl.protocol === 'https:' ||
      !isLocalhost,
    sameSite: 'lax' as const,
    path: '/api/auth',
  };
}

export const authCookie = {
  read(request: NextRequest): string | undefined {
    return request.cookies.get(COOKIE_NAME)?.value;
  },

  save(response: NextResponse, request: NextRequest, refreshToken: string) {
    response.cookies.set(COOKIE_NAME, refreshToken, {
      ...cookieOptions(request),
      maxAge: REFRESH_TOKEN_LIFETIME_SECONDS,
    });
  },

  clear(response: NextResponse, request: NextRequest) {
    response.cookies.set(COOKIE_NAME, '', {
      ...cookieOptions(request),
      maxAge: 0,
      expires: new Date(0),
    });
  },
};
