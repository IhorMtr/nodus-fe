export const browserStorage = {
  remove(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;

      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
