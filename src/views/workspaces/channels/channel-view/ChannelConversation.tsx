'use client';

import { useTranslations } from 'next-intl';

import { DeleteMessageModal } from '@/domains/message/ui/delete-message-modal';
import { MessageComposer } from '@/domains/message/ui/message-composer';
import { MessageList } from '@/domains/message/ui/message-list';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import { useChannelMessages } from './hooks/use-channel-messages';
import { useChannelReadState } from './hooks/use-channel-read-state';
import { useMessageActions } from './hooks/use-message-actions';
import styles from './ChannelConversation.module.scss';

// Mounted per channel (see the key in ChannelView), so scroll position,
// drafts and edit state never leak between channels.
export function ChannelConversation({
  workspaceId,
  channelId,
  hasUnread,
}: {
  workspaceId: string;
  channelId: string;
  hasUnread: boolean;
}) {
  // ==================== CONTEXT ====================

  const t = useTranslations('message');
  const auth = useTranslations('auth.messages');

  // ==================== PAGE HOOKS ====================

  const history = useChannelMessages(workspaceId, channelId);
  const actions = useMessageActions(workspaceId, channelId);
  const readState = useChannelReadState({
    workspaceId,
    channelId,
    messages: history.messages,
    isHistoryReady: !history.isLoading && !history.loadError,
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
      {history.joinError && (
        <p role="status" title={history.joinError}>
          {t('states.realtimeUnavailable')}
        </p>
      )}
      <MessageList
        messages={history.messages}
        canEdit={history.canEdit}
        canDelete={history.canDelete}
        hasOlder={history.hasOlder}
        isLoadingOlder={history.isLoadingOlder}
        hasOlderError={history.hasOlderError}
        onLoadOlder={
          history.hasOlderError ? history.retryOlder : history.loadOlder
        }
        scrollToMessageId={actions.lastSentId}
        editingId={actions.editing.editingId}
        isSavingEdit={actions.editing.isSaving}
        editError={actions.editing.error}
        onEdit={actions.editing.onEdit}
        onSaveEdit={actions.editing.onSave}
        onCancelEdit={actions.editing.onCancel}
        onDelete={actions.deletion.onRequest}
        onBottomChange={readState.onBottomChange}
      />
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
