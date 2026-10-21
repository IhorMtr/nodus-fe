import type { LoginRequest } from '../model/login/login-types';
import type { RegisterRequest } from '../model/register/register-types';
import type { AuthAccessToken } from '../model/session/session-types';

import { authHttpClient } from './auth-http-client';

// ==================== RESPONSE CONTRACTS ====================

interface AuthSessionResponse {
  success: true;
  data: AuthAccessToken;
  messageType: null;
  errors: null;
}

interface AuthCookiePresenceResponse {
  success: true;
  data: { hasRefreshCookie: boolean };
  messageType: null;
  errors: null;
}

// ==================== AUTH REQUESTS ====================

export const authApi = {
  async hasRefreshCookie(): Promise<boolean> {
    const { data } = await authHttpClient.get<AuthCookiePresenceResponse>(
      '/session',
      { headers: { 'Cache-Control': 'no-store' } }
    );
    if (typeof data.data?.hasRefreshCookie !== 'boolean') {
      throw new Error('Unexpected cookie presence response');
    }
    return data.data.hasRefreshCookie;
  },

  async login(payload: LoginRequest) {
    const { data } = await authHttpClient.post<AuthSessionResponse>(
      '/login',
      payload
    );
    return data.data;
  },

  async register(payload: RegisterRequest) {
    const { data } = await authHttpClient.post<AuthSessionResponse>(
      '/register',
      payload
    );
    return data.data;
  },

  async refresh() {
    const { data } = await authHttpClient.post<AuthSessionResponse>('/refresh');
    return data.data;
  },

  async logout(): Promise<void> {
    await authHttpClient.post('/logout');
  },
};
