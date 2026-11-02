'use client';

import { useState } from 'react';

import { authLifecycle } from '@/domains/auth/model/session';
import { useRouter } from '@/shared/i18n/navigation';

export function useUserProfile() {
  // ==================== STATE ====================

  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // ==================== SESSION HANDLER ====================

  async function logout() {
    setLoggingOut(true);

    try {
      await authLifecycle.logout();
    } catch {
      // The local session is cleared even if upstream revocation fails.
    } finally {
      router.replace('/auth/login');
    }
  }

  return { loggingOut, logout };
}
