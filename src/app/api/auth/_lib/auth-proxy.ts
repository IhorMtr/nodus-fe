import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import {
  authErrorResponse,
  forwardAuthRequest,
  type BackendTokens,
} from './auth-backend';
import { authCookie } from './auth-cookie';
import { hasTrustedAuthOrigin } from './auth-security';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

// ==================== TOKEN RESPONSE ====================

function tokenResponse(
  request: NextRequest,
  tokens: BackendTokens | null,
  status: number
) {
  // Only the fields needed for cookie handling and the public response cross this boundary.
  if (
    !tokens ||
    typeof tokens.accessToken !== 'string' ||
    typeof tokens.refreshToken !== 'string' ||
    typeof tokens.expiresAt !== 'string'
  ) {
    return authErrorResponse('InternalError', 502);
  }

  const response = NextResponse.json(
    {
      success: true,
      data: { accessToken: tokens.accessToken, expiresAt: tokens.expiresAt },
      messageType: null,
      errors: null,
    },
    { status, headers: NO_STORE_HEADERS }
  );

  authCookie.save(response, request, tokens.refreshToken);

  return response;
}

// ==================== CREDENTIAL REQUESTS ====================

async function authenticate(
  request: NextRequest,
  endpoint: '/auth/login' | '/auth/register'
) {
  if (!hasTrustedAuthOrigin(request)) {
    return authErrorResponse('Forbidden', 403);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return authErrorResponse('InvalidJson', 400);
  }

  const result = await forwardAuthRequest(endpoint, payload);

  if (result.response) return result.response;

  return tokenResponse(request, result.body.data, result.status);
}

// ==================== SESSION ENDPOINTS ====================

export const authProxy = {
  login(request: NextRequest) {
    return authenticate(request, '/auth/login');
  },

  register(request: NextRequest) {
    return authenticate(request, '/auth/register');
  },

  async refresh(request: NextRequest) {
    if (!hasTrustedAuthOrigin(request)) {
      return authErrorResponse('Forbidden', 403);
    }

    const refreshToken = authCookie.read(request);

    if (!refreshToken) {
      const response = authErrorResponse('InvalidRefreshToken', 401);
      authCookie.clear(response, request);
      return response;
    }

    const result = await forwardAuthRequest('/auth/refresh', { refreshToken });

    if (result.response) {
      if (result.invalidSession) authCookie.clear(result.response, request);
      return result.response;
    }

    return tokenResponse(request, result.body.data, result.status);
  },

  async logout(request: NextRequest) {
    if (!hasTrustedAuthOrigin(request)) {
      return authErrorResponse('Forbidden', 403);
    }

    const refreshToken = authCookie.read(request);
    let response: NextResponse;

    if (refreshToken) {
      const result = await forwardAuthRequest('/auth/logout', { refreshToken });
      response =
        result.response ||
        NextResponse.json(
          { success: true, data: null, messageType: null, errors: null },
          { status: result.status, headers: NO_STORE_HEADERS }
        );
    } else {
      response = NextResponse.json(
        { success: true, data: null, messageType: null, errors: null },
        { headers: NO_STORE_HEADERS }
      );
    }

    // Local logout completes even when upstream session revocation fails.
    authCookie.clear(response, request);

    return response;
  },
};
