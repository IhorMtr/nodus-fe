'use client';

import { useTranslations } from 'next-intl';

import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { ChannelConversation } from './ChannelConversation';
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

  // ==================== LOADING STATE ====================

  if (state.isFetching) {
    return <PageSpinner contained label={t('states.loading')} />;
  }

  // ==================== ACCESS FEEDBACK ====================

  if (
    state.isWorkspaceUnavailable ||
    state.isInvalidLink ||
    state.status === 403
  ) {
    return (
      <PageFeedback
        contained
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
        contained
        title={t('states.unavailable')}
        description={t('states.unavailableDescription')}
        actionLabel={t('actions.openWorkspace')}
        onAction={state.openWorkspace}
      />
    );
  }

  // ==================== REQUEST ERROR ====================

  if (state.error) {
    return (
      <PageFeedback
        contained
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

  // ==================== CHANNEL DATA ====================

  if (!state.channel) {
    return <PageSpinner contained label={t('states.loading')} />;
  }

  // ==================== CHANNEL CONTENT ====================

  // The visible channel title lives in the shell header; the page keeps an
  // accessible heading for screen reader navigation.
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{state.channel.name}</h1>
      <ChannelConversation
        key={`${workspaceId}:${state.channel.id}`}
        workspaceId={workspaceId}
        channelId={state.channel.id}
        hasUnread={state.channel.hasUnread}
      />
    </div>
  );
}
