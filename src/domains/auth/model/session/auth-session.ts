import { browserStorage } from '@/shared/lib/browser-storage';

import type { AuthAccessToken } from './session-types';

// ==================== SESSION STATE ====================

type AuthSessionStatus =
  'initializing' | 'authenticated' | 'anonymous' | 'unavailable';

// Purge tokens left by the former localStorage session. New sessions use HttpOnly cookies.
const LEGACY_REFRESH_TOKEN_KEY = 'nodus.refreshToken';

const serverSnapshot: { status: AuthSessionStatus } = {
  status: 'initializing',
};

let snapshot = serverSnapshot;
let access: AuthAccessToken | null = null;
let version = 0;
const listeners = new Set<() => void>();

function publish(status: AuthSessionStatus) {
  snapshot = { status };
  listeners.forEach(listener => listener());
}

// ==================== BROWSER SESSION ====================

export const authSession = {
  getAccessToken(): string | null {
    return typeof window === 'undefined' ? null : (access?.accessToken ?? null);
  },

  getVersion(): number {
    return typeof window === 'undefined' ? 0 : version;
  },

  beginTransition(): number {
    if (typeof window === 'undefined') {
      return 0;
    }

    browserStorage.remove(LEGACY_REFRESH_TOKEN_KEY);
    ++version;
    access = null;
    publish('initializing');

    return version;
  },

  setAccessToken(tokens: AuthAccessToken, expectedVersion = version): boolean {
    if (typeof window === 'undefined' || expectedVersion !== version) {
      return false;
    }

    access = {
      accessToken: tokens.accessToken,
      expiresAt: tokens.expiresAt,
    };
    publish('authenticated');

    return true;
  },

  clear(): void {
    if (typeof window === 'undefined') {
      return;
    }

    ++version;
    access = null;
    browserStorage.remove(LEGACY_REFRESH_TOKEN_KEY);
    publish('anonymous');
  },

  startInitialization(): void {
    if (typeof window === 'undefined') {
      return;
    }

    browserStorage.remove(LEGACY_REFRESH_TOKEN_KEY);
    publish('initializing');
  },

  finishInitialization(expectedVersion: number, unavailable = false): void {
    if (typeof window === 'undefined' || expectedVersion !== version) {
      return;
    }

    publish(
      access ? 'authenticated' : unavailable ? 'unavailable' : 'anonymous'
    );
  },

  getSnapshot() {
    return typeof window === 'undefined' ? serverSnapshot : snapshot;
  },

  getServerSnapshot() {
    return serverSnapshot;
  },

  subscribe(listener: () => void) {
    if (typeof window === 'undefined') {
      return () => {};
    }

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};

// ==================== IDENTITY CHANGE NOTIFICATIONS ====================

export const authSessionEvents = {
  getVersion: authSession.getVersion,
  subscribe: authSession.subscribe,
};
