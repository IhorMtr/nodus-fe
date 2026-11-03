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
  // ==================== CONTEXT AND PAGE STATE ====================

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
    let description = workspace('states.unavailableDescription');

    if (state.isInvalidLink) {
      description = workspace('states.invalidLink');
    } else if (state.status === 403) {
      description = workspace('states.accessDenied');
    }

    return (
      <PageFeedback
        contained
        title={workspace('states.unavailable')}
        description={description}
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

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{state.channel.name}</h1>
      <ChannelConversation
        key={`${workspaceId}:${state.channel.id}`}
        workspaceId={workspaceId}
        channelId={state.channel.id}
        channelName={state.channel.name}
        hasUnread={state.channel.hasUnread}
      />
    </div>
  );
}
