'use client';

import { ArrowRight, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import styles from './InviteView.module.scss';
import { useInviteView } from './hooks/use-invite-view';

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
            <Button variant="secondary" onClick={retrySession}>
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
