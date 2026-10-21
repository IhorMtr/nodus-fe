import 'server-only';

import { NextResponse } from 'next/server';

// ==================== UPSTREAM CONTRACT ====================

export interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface BackendSuccessResponse {
  success: true;
  data: BackendTokens | null;
  messageType: null;
  errors: null;
}

interface BackendErrorResponse {
  success: false;
  data: null;
  messageType: string;
  errors: Record<string, string[]> | null;
}

type AuthEndpoint =
  '/auth/login' | '/auth/register' | '/auth/refresh' | '/auth/logout';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };
const INVALID_REFRESH_MESSAGES = new Set([
  'InvalidRefreshToken',
  'RefreshTokenExpired',
  'SessionRevoked',
  'RefreshTokenReused',
]);

// ==================== TRANSPORT ERRORS ====================

export function authErrorResponse(messageType: string, status: number) {
  return NextResponse.json<BackendErrorResponse>(
    { success: false, data: null, messageType, errors: null },
    { status, headers: NO_STORE_HEADERS }
  );
}

// ==================== BACKEND TRANSPORT ====================

export async function forwardAuthRequest(
  endpoint: AuthEndpoint,
  payload: unknown
) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!configuredBaseUrl) {
    return { response: authErrorResponse('InternalError', 503) };
  }

  let backendUrl: URL;

  try {
    backendUrl = new URL(`${configuredBaseUrl.replace(/\/+$/, '')}${endpoint}`);

    if (!['http:', 'https:'].includes(backendUrl.protocol)) {
      return { response: authErrorResponse('InternalError', 503) };
    }
  } catch {
    return { response: authErrorResponse('InternalError', 503) };
  }

  let upstream: Response;

  try {
    upstream = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return { response: authErrorResponse('NetworkError', 503) };
  }

  try {
    const body: BackendSuccessResponse | BackendErrorResponse =
      await upstream.json();

    if (body?.success === false) {
      return {
        response: NextResponse.json<BackendErrorResponse>(
          {
            success: false,
            data: null,
            messageType: body.messageType,
            errors: body.errors,
          },
          { status: upstream.status, headers: NO_STORE_HEADERS }
        ),
        invalidSession:
          upstream.status >= 400 &&
          upstream.status < 500 &&
          INVALID_REFRESH_MESSAGES.has(body.messageType),
      };
    }

    if (!upstream.ok || body?.success !== true) {
      return { response: authErrorResponse('InternalError', 502) };
    }

    return { body, status: upstream.status };
  } catch {
    // HTML error pages and malformed upstream JSON are transport failures.
    return { response: authErrorResponse('InternalError', 502) };
  }
}
