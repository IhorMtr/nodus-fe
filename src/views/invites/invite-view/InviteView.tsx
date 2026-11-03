'use client';

import { ArrowRight, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Link } from '@/shared/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Spinner } from '@/shared/ui/spinner';

import styles from './InviteView.module.scss';
import { useInviteView } from './hooks/use-invite-view';

// ==================== PAGE VIEW ====================

export function InviteView() {
  // ==================== VIEW STATE ====================

  const t = useTranslations('invite');
  const {
    status,
    token,
    ready,
    resolved,
    accept,
    acceptErrorKey,
    cannotRetryAcceptance,
    resolveErrorKey,
    canRetryResolve,
    acceptInvite,
    decline,
    retryResolve,
    retrySession,
    formatDate,
  } = useInviteView();

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
    return (
      <main className={styles.page}>
        <div className={styles.card} role="alert">
          <h1>{t('page.title')}</h1>
          <p>{t(`errors.${resolveErrorKey ?? 'requestFailed'}`)}</p>
          {canRetryResolve && (
            <Button variant="secondary" onClick={retryResolve}>
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

  // ==================== SESSION ACTIONS ====================

  let sessionActions: ReactNode;

  if (status === 'authenticated') {
    sessionActions = (
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
          <InlineStatus tone="danger" role="alert">
            {t(`errors.${acceptErrorKey}`)}
          </InlineStatus>
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
    );
  } else if (status === 'initializing') {
    sessionActions = <Spinner label={t('page.checkingSession')} />;
  } else if (status === 'unavailable') {
    sessionActions = (
      <div className={styles.actions}>
        <p>{t('page.sessionUnavailable')}</p>
        <Button variant="secondary" onClick={retrySession}>
          {t('actions.retry')}
        </Button>
      </div>
    );
  } else {
    sessionActions = (
      <div className={styles.actions}>
        <p>{t('page.signInPrompt')}</p>
        <Link href="/auth/login" className={styles.primaryLink}>
          {t('actions.login')}
        </Link>
        <Link href="/auth/register" className={styles.secondaryLink}>
          {t('actions.register')}
        </Link>
      </div>
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

        {sessionActions}

        <button className={styles.decline} type="button" onClick={decline}>
          {t('actions.leave')}
        </button>
      </div>
    </main>
  );
}
