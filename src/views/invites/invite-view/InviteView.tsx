'use client';

import { ArrowRight, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { authLifecycle, useAuthSession } from '@/domains/auth/model/session';
import {
  getInviteErrorKey,
  inviteStorage,
  useAcceptInviteMutation,
  useResolveInviteMutation,
} from '@/domains/invite/model/invitations';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import { workspaceQueryKeys } from '@/domains/workspace/model/workspace';
import { Link, useRouter } from '@/shared/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import styles from './InviteView.module.scss';

const finalErrors = new Set([
  'InviteNotFound',
  'InviteExpired',
  'InviteRevoked',
  'InviteAlreadyUsed',
  'AlreadyWorkspaceMember',
]);

export function InviteView() {
  const t = useTranslations('invite');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useAuthSession();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const resolved = useResolveInviteMutation();
  const accept = useAcceptInviteMutation();
  const user = useCurrentUserQuery({ enabled: status === 'authenticated' });
  const resolveInvite = resolved.mutate;
  const acceptErrorKey = accept.isError
    ? getInviteErrorKey(accept.error)
    : null;
  const cannotRetryAcceptance =
    acceptErrorKey !== null && finalErrors.has(acceptErrorKey);

  // ==================== INVITE AND SESSION RESTORATION ====================

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const incomingToken = fragment.get('token');

    if (incomingToken) {
      inviteStorage.set(incomingToken);
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }

    const pendingToken = incomingToken ?? inviteStorage.get();
    queueMicrotask(() => {
      setToken(pendingToken);
      setReady(true);
    });

    void authLifecycle.initialize().catch(() => {
      // Session status provides recovery feedback; invite resolution remains public.
    });
  }, []);

  useEffect(() => {
    if (token) {
      resolveInvite(token);
    }
  }, [token, resolveInvite]);

  useEffect(() => {
    if (
      resolved.isError &&
      finalErrors.has(getInviteErrorKey(resolved.error))
    ) {
      inviteStorage.clear();
    }
  }, [resolved.isError, resolved.error]);

  // ==================== HANDLERS ====================

  const acceptInvite = async () => {
    if (!token) {
      return;
    }

    try {
      const membership = await accept.mutateAsync(token);
      inviteStorage.clear();

      if (user.data) {
        workspaceNavigation.setLastWorkspaceId(
          user.data.id,
          membership.workspaceId
        );
      }

      void queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.list,
      });

      router.replace({
        pathname: '/workspaces/[workspaceId]',
        params: { workspaceId: membership.workspaceId },
      });
    } catch (error) {
      if (finalErrors.has(getInviteErrorKey(error))) {
        inviteStorage.clear();
      }
    }
  };

  const decline = () => {
    inviteStorage.clear();
    router.replace(status === 'authenticated' ? '/app' : '/');
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(value));

  // ==================== FEEDBACK ====================

  if (!ready || (token && resolved.isPending)) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <Spinner label={t('page.loading')} />
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1>{t('page.title')}</h1>
          <p>{t('page.missing')}</p>
          <Link href="/">{t('actions.home')}</Link>
        </div>
      </main>
    );
  }

  if (resolved.isError) {
    const errorKey = getInviteErrorKey(resolved.error);
    return (
      <main className={styles.page}>
        <div className={styles.card} role="alert">
          <h1>{t('page.title')}</h1>
          <p>{t(`errors.${errorKey}`)}</p>
          {(errorKey === 'networkError' || errorKey === 'requestFailed') && (
            <Button variant="secondary" onClick={() => resolved.mutate(token)}>
              {t('actions.retry')}
            </Button>
          )}
          <Button variant="secondary" onClick={decline}>
            {t('actions.leave')}
          </Button>
        </div>
      </main>
    );
  }

  if (!resolved.data) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <Spinner label={t('page.loading')} />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className={styles.icon}>
          <Users size={24} aria-hidden="true" />
        </span>
        <p className={styles.eyebrow}>{t('page.eyebrow')}</p>
        <h1>{t('page.title')}</h1>
        <p className={styles.workspace}>{resolved.data.name}</p>
        <p className={styles.expiry}>
          {t('page.expires', { date: formatDate(resolved.data.expiresAt) })}
        </p>

        {status === 'authenticated' ? (
          <>
            {!cannotRetryAcceptance && (
              <Button
                rightIcon={<ArrowRight size={16} />}
                onClick={() => void acceptInvite()}
                loading={accept.isPending}
                disabled={accept.isPending}
              >
                {t('actions.accept')}
              </Button>
            )}
            {acceptErrorKey && (
              <p className={styles.error} role="alert">
                {t(`errors.${acceptErrorKey}`)}
              </p>
            )}
            {acceptErrorKey === 'AlreadyWorkspaceMember' && (
              <Link
                href={{
                  pathname: '/workspaces/[workspaceId]',
                  params: { workspaceId: resolved.data.id },
                }}
              >
                {t('actions.openWorkspace')}
              </Link>
            )}
          </>
        ) : status === 'initializing' ? (
          <Spinner label={t('page.checkingSession')} />
        ) : status === 'unavailable' ? (
          <div className={styles.actions}>
            <p>{t('page.sessionUnavailable')}</p>
            <Button
              variant="secondary"
              onClick={() =>
                void authLifecycle.initialize({ retry: true }).catch(() => {})
              }
            >
              {t('actions.retry')}
            </Button>
          </div>
        ) : (
          <div className={styles.actions}>
            <p>{t('page.signInPrompt')}</p>
            <Link href="/auth/login" className={styles.primaryLink}>
              {t('actions.login')}
            </Link>
            <Link href="/auth/register" className={styles.secondaryLink}>
              {t('actions.register')}
            </Link>
          </div>
        )}

        <button className={styles.decline} type="button" onClick={decline}>
          {t('actions.leave')}
        </button>
      </div>
    </main>
  );
}
