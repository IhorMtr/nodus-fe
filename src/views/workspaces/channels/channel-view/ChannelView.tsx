'use client';

import { useTranslations } from 'next-intl';

import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { useChannelView } from './hooks/use-channel-view';
import styles from './ChannelView.module.scss';

export function ChannelView({
  workspaceId,
  channelId,
}: {
  workspaceId: string;
  channelId: string;
}) {
  const t = useTranslations('channel');
  const workspace = useTranslations('workspace');
  const auth = useTranslations('auth.messages');
  const state = useChannelView(workspaceId, channelId);

  if (state.isFetching) return <PageSpinner label={t('states.loading')} />;

  if (
    state.isWorkspaceUnavailable ||
    state.isInvalidLink ||
    state.status === 403
  ) {
    return (
      <PageFeedback
        title={workspace('states.unavailable')}
        description={
          state.isInvalidLink
            ? workspace('states.invalidLink')
            : state.status === 403
              ? workspace('states.accessDenied')
              : workspace('states.unavailableDescription')
        }
        actionLabel={workspace('actions.openAvailable')}
        onAction={state.openApp}
      />
    );
  }

  if (state.isUnavailable) {
    return (
      <PageFeedback
        title={t('states.unavailable')}
        description={t('states.unavailableDescription')}
        actionLabel={t('actions.openWorkspace')}
        onAction={state.openWorkspace}
      />
    );
  }

  if (state.error) {
    return (
      <PageFeedback
        title={t('states.loadError')}
        description={
          state.status === 401
            ? auth('sessionExpired')
            : t('states.loadErrorDescription')
        }
        actionLabel={workspace('actions.retry')}
        onAction={state.retry}
      />
    );
  }

  if (!state.channel) return <PageSpinner label={t('states.loading')} />;

  return (
    <main className={styles.page}>
      <section className={styles.channel} aria-labelledby="channel-title">
        <h1 id="channel-title"># {state.channel.name}</h1>
        <p>{t('messagesPending')}</p>
      </section>
    </main>
  );
}
