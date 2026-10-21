import {
  isAxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

// ==================== AUTHENTICATION CONTRACT ====================

type HttpAuthentication = {
  getAccessToken: () => string | null;
  getVersion: () => number;
  recoverAccessToken: (
    error: unknown,
    version: number,
    usedToken: string | null
  ) => Promise<string | null>;
};

type AuthenticatedRequest = InternalAxiosRequestConfig & {
  _auth?: { version: number; accessToken: string | null; retried: boolean };
};

let authentication: HttpAuthentication | undefined;

export function configureHttpAuthentication(adapter: HttpAuthentication) {
  authentication = adapter;
}

export function installHttpAuthentication(client: AxiosInstance) {
  // ==================== BEARER INJECTION ====================

  client.interceptors.request.use((request: AuthenticatedRequest) => {
    if (
      typeof window !== 'undefined' &&
      authentication &&
      !request.headers.has('Authorization')
    ) {
      const accessToken = authentication.getAccessToken();
      request._auth = {
        version: authentication.getVersion(),
        accessToken,
        retried: false,
      };

      if (accessToken) {
        request.headers.set('Authorization', `Bearer ${accessToken}`);
      }
    }

    return request;
  });

  // ==================== ACCESS TOKEN RECOVERY ====================

  client.interceptors.response.use(undefined, async (error: unknown) => {
    if (
      typeof window === 'undefined' ||
      !authentication ||
      !isAxiosError(error)
    ) {
      throw error;
    }

    const request = error.config as AuthenticatedRequest | undefined;
    const previous = request?._auth;

    if (!request || !previous?.accessToken || previous.retried) throw error;

    let accessToken: string | null;
    try {
      accessToken = await authentication.recoverAccessToken(
        error,
        previous.version,
        previous.accessToken
      );
    } catch (recoveryError) {
      // Keep the terminal 401 so query retries cannot start another refresh cycle.
      error.cause =
        recoveryError instanceof Error
          ? recoveryError
          : new Error('Authentication recovery failed', {
              cause: recoveryError,
            });
      throw error;
    }

    if (!accessToken || previous.version !== authentication.getVersion()) {
      throw error;
    }

    request._auth = { ...previous, accessToken, retried: true };
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return client(request);
  });
}
