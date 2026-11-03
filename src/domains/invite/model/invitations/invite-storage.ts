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
    } catch {}
  },

  clear(): void {
    try {
      sessionStorage.removeItem(KEY);
    } catch {}
  },
};
