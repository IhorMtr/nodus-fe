import { isAxiosError } from 'axios';

import { configureHttpAuthentication } from '@/shared/api/http-authentication';
import { httpClient } from '@/shared/api/http-client';

import { authApi } from '../../api/auth-api';
import { AuthError } from '../errors';
import type { AuthErrorResponse } from '../errors/auth-errors';

import { authSession } from './auth-session';
import type { AuthAccessToken } from './session-types';

// ==================== LIFECYCLE STATE ====================

const invalidSessionErrors = new Set([
  'InvalidRefreshToken',
  'RefreshTokenExpired',
  'SessionRevoked',
  'RefreshTokenReused',
]);

let cookieOperation: Promise<void> = Promise.resolve();
let authenticationPending = false;
let refreshFlight: Promise<void> | null = null;
let initialization: Promise<void> | null = null;

function isInvalidSession(error: AuthError): boolean {
  const status = isAxiosError(error.cause)
    ? error.cause.response?.status
    : undefined;
  return (
    invalidSessionErrors.has(error.messageType) &&
    status !== undefined &&
    status >= 400 &&
    status < 500
  );
}

// ==================== COOKIE OPERATIONS ====================

function enqueue(operation: () => Promise<void>): Promise<void> {
  if (typeof window === 'undefined')
    return Promise.reject(new AuthError('InternalError'));
  const result = cookieOperation.then(operation);
  cookieOperation = result.catch(() => {});
  return result;
}

export const authLifecycle = {
  // ==================== AUTHENTICATION ====================

  authenticate(request: () => Promise<AuthAccessToken>): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.reject(new AuthError('InternalError'));
    }
    if (authenticationPending) {
      return Promise.reject(new AuthError('SessionChanged'));
    }
    authenticationPending = true;
    const version = authSession.beginTransition();
    return enqueue(async () => {
      if (version !== authSession.getVersion())
        throw new AuthError('SessionChanged');
      try {
        const tokens = await request();
        if (!authSession.setAccessToken(tokens, version))
          throw new AuthError('SessionChanged');
      } finally {
        authSession.finishInitialization(version);
      }
    }).finally(() => {
      authenticationPending = false;
    });
  },

  // ==================== REFRESH ROTATION ====================

  refresh(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.reject(new AuthError('InternalError'));
    }
    if (refreshFlight) return refreshFlight;
    const version = authSession.getVersion();
    const operation = enqueue(async () => {
      if (version !== authSession.getVersion()) return;
      try {
        const tokens = await authApi.refresh();
        authSession.setAccessToken(tokens, version);
      } catch (error) {
        const authError = AuthError.from(error);
        if (
          version === authSession.getVersion() &&
          isInvalidSession(authError)
        ) {
          authSession.clear();
        }
        throw authError;
      }
    });
    refreshFlight = operation.finally(() => {
      refreshFlight = null;
    });
    return refreshFlight;
  },

  // ==================== SESSION RESTORATION ====================

  initialize({ retry = false }: { retry?: boolean } = {}): Promise<void> {
    if (
      typeof window === 'undefined' ||
      authSession.getSnapshot().status === 'authenticated'
    ) {
      return Promise.resolve();
    }
    if (retry && authSession.getSnapshot().status === 'unavailable') {
      initialization = null;
    }
    if (initialization) return initialization;
    const version = authSession.getVersion();
    authSession.startInitialization();
    initialization = authApi
      .hasRefreshCookie()
      .then(hasRefreshCookie => {
        // A presence check must not revive a newer login/logout transition.
        if (
          version !== authSession.getVersion() ||
          authSession.getSnapshot().status === 'authenticated' ||
          !hasRefreshCookie
        )
          return;
        return authLifecycle.refresh();
      })
      .then(
        () => authSession.finishInitialization(version),
        error => {
          authSession.finishInitialization(version, true);
          const authError = AuthError.from(error);
          if (!isInvalidSession(authError)) throw authError;
        }
      );
    return initialization;
  },

  // ==================== LOGOUT ====================

  logout(): Promise<void> {
    authSession.clear();
    initialization = Promise.resolve();
    // Await older refresh responses before deleting their rotated cookie.
    return enqueue(() => authApi.logout());
  },
};

// ==================== ACCESS TOKEN RECOVERY ====================

configureHttpAuthentication({
  getAccessToken: authSession.getAccessToken,
  getVersion: authSession.getVersion,
  async recoverAccessToken(error, version, usedToken) {
    if (
      !usedToken ||
      version !== authSession.getVersion() ||
      !isAxiosError<AuthErrorResponse>(error) ||
      error.response?.status !== 401 ||
      error.response.data?.messageType !== 'AccessTokenExpired'
    )
      return null;

    const requestUrl = httpClient.getUri(error.config);
    if (
      /\/auth\/(?:login|register|refresh|logout)\/?(?:[?#]|$)/.test(requestUrl)
    ) {
      return null;
    }

    const currentToken = authSession.getAccessToken();
    if (currentToken && currentToken !== usedToken) return currentToken;

    await authLifecycle.refresh();
    return version === authSession.getVersion()
      ? authSession.getAccessToken()
      : null;
  },
});
