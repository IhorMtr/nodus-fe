'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { authLifecycle, useAuthSession } from '@/domains/auth/model/session';
import { SessionFeedback } from '@/domains/auth/ui/session-feedback';
import { useRouter } from '@/shared/i18n/navigation';

function reportInitializationError(error: unknown) {
  console.error('Failed to check authentication session', error);
}

export function AuthEntryGuard({ children }: { children: ReactNode }) {
  const { status } = useAuthSession();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [continueToForm, setContinueToForm] = useState(false);

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

  // ==================== AUTHENTICATION ENTRY ====================

  useEffect(() => {
    if (status === 'authenticated') router.replace('/app');
  }, [status, router]);

  if (!initialized || status === 'initializing' || status === 'authenticated') {
    return <SessionFeedback />;
  }

  if (status === 'unavailable' && !continueToForm) {
    return (
      <SessionFeedback
        unavailable
        onRetry={() => {
          void authLifecycle
            .initialize({ retry: true })
            .catch(reportInitializationError);
        }}
        onContinue={() => setContinueToForm(true)}
      />
    );
  }

  return children;
}
