'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { authLifecycle, useAuthSession } from '@/domains/auth/model/session';
import { SessionFeedback } from '@/domains/auth/ui/session-feedback';
import { useRouter } from '@/shared/i18n/navigation';

function reportInitializationError(error: unknown) {
  console.error('Failed to restore authentication session', error);
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const { status } = useAuthSession();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  // ==================== SESSION RESTORATION ====================

  useEffect(() => {
    let mounted = true;

    void authLifecycle
      .initialize()
      .catch(reportInitializationError)
      .finally(() => {
        if (mounted) setInitialized(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ==================== PRIVATE ROUTE ACCESS ====================

  useEffect(() => {
    if (initialized && status === 'anonymous') {
      router.replace('/auth/login');
    }
  }, [initialized, status, router]);

  if (!initialized || status === 'initializing') {
    return <SessionFeedback />;
  }

  if (status === 'unavailable') {
    return (
      <SessionFeedback
        unavailable
        onRetry={() => {
          void authLifecycle
            .initialize({ retry: true })
            .catch(reportInitializationError);
        }}
      />
    );
  }

  return status === 'authenticated' ? children : null;
}
