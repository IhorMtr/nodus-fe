const KEY = 'nodus.pendingInvite';

export const inviteStorage = {
  get(): string | null {
    try {
      return typeof window === 'undefined' ? null : sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  },

  set(token: string): void {
    try {
      sessionStorage.setItem(KEY, token);
    } catch {
      // The invite page remains usable when tab storage is unavailable.
    }
  },

  clear(): void {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // The invite page remains usable when tab storage is unavailable.
    }
  },
};
