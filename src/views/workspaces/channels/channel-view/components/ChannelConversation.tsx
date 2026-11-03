'use client';

import { Hash, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getChannelColor } from '@/domains/channel/ui/channel-identity';
import { DeleteMessageModal } from '@/domains/message/ui/delete-message-modal';
import { MessageComposer } from '@/domains/message/ui/message-composer';
import { MessageList } from '@/domains/message/ui/message-list';
import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Spinner } from '@/shared/ui/spinner';

import { useChannelMessages } from '../hooks/use-channel-messages';
import { useChannelMessageNavigation } from '../hooks/use-channel-message-navigation';
import { useChannelReadState } from '../hooks/use-channel-read-state';
import { useMessageActions } from '../hooks/use-message-actions';
import styles from './ChannelConversation.module.scss';

export function ChannelConversation({
  workspaceId,
  channelId,
  channelName,
  hasUnread,
}: {
  workspaceId: string;
  channelId: string;
  channelName: string;
  hasUnread: boolean;
}) {
  // ==================== CONTEXT ====================

  const t = useTranslations('message');
  const auth = useTranslations('auth.messages');

  // ==================== PAGE HOOKS ====================

  const history = useChannelMessages(workspaceId, channelId);
  const navigation = useChannelMessageNavigation(
    workspaceId,
    channelId,
    history.joinEpoch,
    { events: history.pendingContextEvents, reads: history.pendingContextReads }
  );
  const actions = useMessageActions(workspaceId, channelId);
  const messages = navigation.isContextActive
    ? navigation.messages
    : history.messages;
  let loadOlder = history.loadOlder;
  if (navigation.isContextActive) {
    loadOlder = navigation.loadOlder;
  } else if (history.hasOlderError) {
    loadOlder = history.retryOlder;
  }

  const readState = useChannelReadState({
    workspaceId,
    channelId,
    messages: history.messages,
    isHistoryReady:
      !navigation.isContextRequested &&
      !history.isLoading &&
      !history.loadError,
    hasUnread,
  });

  // ==================== LOADING AND ERROR STATES ====================

  if (history.isLoading && !history.loadError) {
    return (
      <div className={styles.state}>
        <Spinner label={t('states.loading')} />
      </div>
    );
  }

  if (history.loadError || history.currentUserId === undefined) {
    return (
      <div className={styles.state}>
        <h2>{t('states.loadError')}</h2>
        <p role="status">
          {history.isSessionExpired
            ? auth('sessionExpired')
            : (history.loadError ?? t('states.loadErrorDescription'))}
        </p>
        <Button variant="secondary" onClick={history.retry}>
          {t('actions.retry')}
        </Button>
      </div>
    );
  }

  // ==================== CONVERSATION ====================

  return (
    <div className={styles.conversation}>
      {/* ==================== REALTIME STATUS ==================== */}

      {history.joinError && (
        <div className={styles.realtime}>
          <InlineStatus
            tone="warning"
            icon={<WifiOff />}
            role="status"
            title={history.joinError}
          >
            {t('states.realtimeUnavailable')}
          </InlineStatus>
        </div>
      )}

      {/* ==================== CONTEXT NAVIGATION ==================== */}

      {navigation.isContextRequested && (
        <div className={styles.contextAction}>
          <Button
            size="sm"
            variant="secondary"
            onClick={navigation.jumpToLatest}
          >
            {t('actions.jumpToLatest')}
          </Button>
        </div>
      )}
      {navigation.isLoadingContext && (
        <div className={styles.contextFeedback} role="status">
          <Spinner size="sm" label={t('states.loadingContext')} />
        </div>
      )}
      {navigation.error && (
        <div className={styles.contextFeedback} role="alert">
          <span>{navigation.error}</span>
          {navigation.canRetry && (
            <Button size="sm" variant="secondary" onClick={navigation.retry}>
              {t('actions.retry')}
            </Button>
          )}
        </div>
      )}

      {/* ==================== MESSAGES ==================== */}

      <MessageList
        key={
          navigation.isContextActive
            ? `context:${navigation.targetRequest?.messageId}`
            : 'latest'
        }
        channelName={channelName}
        emptyIcon={
          <Hash size={22} style={{ color: getChannelColor(channelId) }} />
        }
        messages={messages}
        canEdit={history.canEdit}
        canDelete={history.canDelete}
        getReceipt={message =>
          message.author.id === history.currentUserId
            ? {
                read: message.receipt?.read ?? false,
                readers: message.receipt?.readers.filter(
                  reader => reader.id !== history.currentUserId
                ),
              }
            : undefined
        }
        hasOlder={
          navigation.isContextActive ? navigation.hasOlder : history.hasOlder
        }
        isLoadingOlder={
          navigation.isContextActive
            ? navigation.isLoadingOlder
            : history.isLoadingOlder
        }
        hasOlderError={
          navigation.isContextActive
            ? navigation.hasOlderError
            : history.hasOlderError
        }
        onLoadOlder={loadOlder}
        hasNewer={navigation.isContextActive && navigation.hasNewer}
        isLoadingNewer={navigation.isContextActive && navigation.isLoadingNewer}
        hasNewerError={navigation.isContextActive && navigation.hasNewerError}
        onLoadNewer={navigation.loadNewer}
        followLatest={!navigation.isContextActive}
        targetRequest={
          navigation.isContextActive ? navigation.targetRequest : undefined
        }
        scrollToMessageId={
          navigation.isContextActive ? undefined : actions.lastSentId
        }
        editingId={actions.editing.editingId}
        isSavingEdit={actions.editing.isSaving}
        editError={actions.editing.error}
        onEdit={actions.editing.onEdit}
        onSaveEdit={actions.editing.onSave}
        onCancelEdit={actions.editing.onCancel}
        onDelete={actions.deletion.onRequest}
        onBottomChange={
          navigation.isContextActive ? undefined : readState.onBottomChange
        }
      />

      {/* ==================== COMPOSER AND DIALOGS ==================== */}

      <MessageComposer
        onSubmit={actions.composer.onSubmit}
        isSubmitting={actions.composer.isSubmitting}
        error={actions.composer.error}
      />
      <DeleteMessageModal
        opened={actions.deletion.isOpen}
        isDeleting={actions.deletion.isDeleting}
        error={actions.deletion.error}
        onConfirm={actions.deletion.onConfirm}
        onClose={actions.deletion.onClose}
      />
    </div>
  );
}
