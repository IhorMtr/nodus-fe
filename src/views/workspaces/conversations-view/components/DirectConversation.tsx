'use client';

import { MessagesSquare, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { Conversation } from '@/domains/conversation/model/conversations';
import { DeleteMessageModal } from '@/domains/message/ui/delete-message-modal';
import { MessageComposer } from '@/domains/message/ui/message-composer';
import { MessageList } from '@/domains/message/ui/message-list';
import { getHttpStatus } from '@/shared/api/http-error';
import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Spinner } from '@/shared/ui/spinner';

import { useDirectConversation } from '../hooks/use-direct-conversation';
import styles from './DirectConversation.module.scss';

// ==================== TYPES ====================

interface DirectConversationProps {
  workspaceId: string;
  conversation: Conversation;
  currentUserId: string;
}

// ==================== RENDER ====================

export function DirectConversation({
  workspaceId,
  conversation,
  currentUserId,
}: DirectConversationProps) {
  // ==================== PAGE STATE ====================

  const t = useTranslations('conversation');
  const messageText = useTranslations('message');
  const state = useDirectConversation(workspaceId, conversation, currentUserId);
  const name =
    `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`.trim();

  // ==================== CONNECTION STATE ====================

  if (!state.realtime.canLoadHistory || state.history.isPending) {
    if (!state.realtime.error) {
      return (
        <div className={styles.state}>
          <Spinner label={messageText('states.loading')} />
        </div>
      );
    }

    return (
      <div className={styles.state}>
        <InlineStatus tone="danger" role="alert">
          {t('joinError')}
        </InlineStatus>
        <Button variant="secondary" onClick={state.realtime.retry}>
          {messageText('actions.retry')}
        </Button>
      </div>
    );
  }

  // ==================== HISTORY ERROR ====================

  if (state.history.isError && !state.history.data) {
    const status = getHttpStatus(state.history.error);
    const unavailable = status === 403 || status === 404;

    return (
      <div className={styles.state}>
        <p>
          {unavailable ? t('unavailable') : messageText('states.loadError')}
        </p>
        <Button
          variant="secondary"
          onClick={() => void state.history.refetch()}
        >
          {messageText('actions.retry')}
        </Button>
      </div>
    );
  }

  // ==================== CONVERSATION ====================

  return (
    <div className={styles.conversation}>
      {/* ==================== REALTIME FEEDBACK ==================== */}

      {state.realtime.error && (
        <div className={styles.realtime}>
          <InlineStatus tone="warning" icon={<WifiOff />} role="status">
            {messageText('states.realtimeUnavailable')}
          </InlineStatus>
        </div>
      )}

      {/* ==================== MESSAGE HISTORY ==================== */}

      <MessageList
        channelName={name}
        emptyTitle={t('emptyHistory', { name })}
        emptyDescription={t('emptyHistoryDescription')}
        emptyIcon={<MessagesSquare size={22} />}
        messages={state.messages}
        canEdit={state.canEdit}
        canDelete={state.canDelete}
        getReceipt={message =>
          message.author.id === currentUserId
            ? { read: message.read ?? false }
            : undefined
        }
        hasOlder={Boolean(state.history.hasNextPage)}
        isLoadingOlder={state.history.isFetchingNextPage}
        hasOlderError={state.history.isFetchNextPageError}
        onLoadOlder={
          state.history.isFetchNextPageError
            ? state.retryOlder
            : state.loadOlder
        }
        scrollToMessageId={state.lastSentId}
        editingId={state.editing.editingId}
        isSavingEdit={state.editing.isSaving}
        editError={state.editing.error}
        onEdit={state.editing.onEdit}
        onSaveEdit={state.editing.onSave}
        onCancelEdit={state.editing.onCancel}
        onDelete={state.deletion.onRequest}
        onBottomChange={state.onBottomChange}
      />

      {/* ==================== COMPOSER AND CONFIRMATION ==================== */}

      <MessageComposer {...state.composer} />
      <DeleteMessageModal
        opened={state.deletion.isOpen}
        isDeleting={state.deletion.isDeleting}
        error={state.deletion.error}
        onConfirm={state.deletion.onConfirm}
        onClose={state.deletion.onClose}
      />
    </div>
  );
}
