'use client';

import { Menu } from '@mantine/core';
import { isAxiosError } from 'axios';
import { isToday } from 'date-fns';
import { ArrowLeft, MessagesSquare, Plus, WifiOff } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { type Conversation } from '@/domains/conversation/model/conversations';
import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import { DeleteMessageModal } from '@/domains/message/ui/delete-message-modal';
import { MessageComposer } from '@/domains/message/ui/message-composer';
import { MessageList } from '@/domains/message/ui/message-list';
import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Spinner } from '@/shared/ui/spinner';
import { useConversationsView } from './hooks/use-conversations-view';
import { useDirectConversation } from './hooks/use-direct-conversation';
import styles from './ConversationsView.module.scss';

// ==================== CONVERSATION ROW ====================

function ConversationRow({
  conversation,
  active,
  onOpen,
}: {
  conversation: Conversation;
  active: boolean;
  onOpen: () => void;
}) {
  const t = useTranslations('conversation');
  const locale = useLocale();
  const person = conversation.otherUser;
  const name = `${person.firstName} ${person.lastName}`.trim();
  const last = conversation.lastMessage;
  let time = '';

  if (last) {
    const createdAt = new Date(last.createdAt);
    const formatOptions: Intl.DateTimeFormatOptions = isToday(createdAt)
      ? { hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'short' };

    time = new Intl.DateTimeFormat(locale, formatOptions).format(createdAt);
  }

  const unreadCountLabel =
    conversation.unreadCount > 99 ? '99+' : conversation.unreadCount;
  return (
    <li>
      <button
        type="button"
        className={styles.row}
        data-active={active || undefined}
        data-unread={conversation.hasUnread || undefined}
        onClick={onOpen}
        aria-current={active ? 'page' : undefined}
      >
        <span className={styles.avatar}>
          <span aria-hidden="true">
            {person.firstName.charAt(0)}
            {person.lastName.charAt(0)}
          </span>
          <PresenceIndicator
            status={person.status}
            withLabel={false}
            className={styles.presence}
          />
        </span>
        <span className={styles.rowBody}>
          <span className={styles.rowTop}>
            <strong>{name}</strong>
            <time dateTime={last?.createdAt}>{time}</time>
          </span>
          <span className={styles.rowBottom}>
            <span>{last?.content ?? t('noMessages')}</span>
            {conversation.unreadCount > 0 && (
              <span
                className={styles.unread}
                aria-label={t('unread', { count: conversation.unreadCount })}
              >
                {unreadCountLabel}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}

// ==================== ACTIVE CONVERSATION ====================

function ActiveConversation({
  workspaceId,
  conversation,
  currentUserId,
}: {
  workspaceId: string;
  conversation: Conversation;
  currentUserId: string;
}) {
  const t = useTranslations('conversation');
  const messageText = useTranslations('message');
  const state = useDirectConversation(workspaceId, conversation, currentUserId);
  const name =
    `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`.trim();

  if (!state.realtime.canLoadHistory || state.history.isPending) {
    return (
      <div className={styles.state}>
        {state.realtime.error ? (
          <>
            <InlineStatus tone="danger" role="alert">
              {t('joinError')}
            </InlineStatus>
            <Button variant="secondary" onClick={state.realtime.retry}>
              {messageText('actions.retry')}
            </Button>
          </>
        ) : (
          <Spinner label={messageText('states.loading')} />
        )}
      </div>
    );
  }
  if (state.history.isError && !state.history.data) {
    const unavailable =
      isAxiosError(state.history.error) &&
      [403, 404].includes(state.history.error.response?.status ?? 0);
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
        emptyIcon={<MessagesSquare size={24} />}
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

// ==================== VIEW ====================

export function ConversationsView({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId?: string;
}) {
  const t = useTranslations('conversation');
  const workspace = useTranslations('workspace');
  const state = useConversationsView(workspaceId, conversationId);

  return (
    <div
      className={styles.page}
      data-selected={Boolean(conversationId) || undefined}
    >
      {/* ==================== CONVERSATION LIST ==================== */}
      <section
        className={styles.listPane}
        aria-label={workspace('navigation.conversations')}
      >
        <div className={styles.listHeading}>
          <h1>{workspace('navigation.conversations')}</h1>
          <Menu withinPortal position="bottom-end">
            <Menu.Target>
              <button
                type="button"
                className={styles.newButton}
                aria-label={t('new')}
                title={t('new')}
              >
                <Plus size={18} />
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{t('chooseMember')}</Menu.Label>
              {state.members.isPending && (
                <Menu.Label>{t('loadingMembers')}</Menu.Label>
              )}
              {state.members.isError && (
                <Menu.Item onClick={() => void state.members.refetch()}>
                  {workspace('actions.retry')}
                </Menu.Item>
              )}
              {state.availableMembers.map(member => (
                <Menu.Item
                  key={member.userId}
                  disabled={state.open.isPending}
                  onClick={() => {
                    void state.start(member.userId).catch(() => undefined);
                  }}
                >
                  {member.firstName} {member.lastName}
                </Menu.Item>
              ))}
              {state.members.isSuccess &&
                state.availableMembers.length === 0 && (
                  <Menu.Label>{t('noMembers')}</Menu.Label>
                )}
            </Menu.Dropdown>
          </Menu>
        </div>
        {state.open.isError && (
          <div className={styles.listFeedback}>
            <InlineStatus tone="danger" role="alert">
              {t('openError')}
            </InlineStatus>
          </div>
        )}
        {state.list.isPending && (
          <div className={styles.state}>
            <Spinner label={t('loading')} />
          </div>
        )}
        {state.list.isError && !state.list.data && (
          <div className={styles.state}>
            <p>{t('listError')}</p>
            <Button
              variant="secondary"
              onClick={() => void state.list.refetch()}
            >
              {workspace('actions.retry')}
            </Button>
          </div>
        )}
        {state.list.isSuccess && state.conversations.length === 0 && (
          <div className={styles.listEmpty}>
            <p>{t('emptyList')}</p>
            <span>{t('emptyListDescription')}</span>
          </div>
        )}
        {state.conversations.length > 0 && (
          <ul className={styles.rows}>
            {state.conversations.map(conversation => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === conversationId}
                onOpen={() => state.navigate(conversation.id)}
              />
            ))}
          </ul>
        )}
      </section>
      {/* ==================== OPEN CONVERSATION ==================== */}
      <section
        className={styles.chatPane}
        aria-label={
          state.selected
            ? `${state.selected.otherUser.firstName} ${state.selected.otherUser.lastName}`
            : t('selectConversation')
        }
      >
        {conversationId && state.list.isPending && (
          <div className={styles.state}>
            <Spinner label={t('loading')} />
          </div>
        )}
        {conversationId && state.list.isError && !state.list.data && (
          <div className={styles.state}>
            <p>{t('listError')}</p>
            <Button
              variant="secondary"
              onClick={() => void state.list.refetch()}
            >
              {workspace('actions.retry')}
            </Button>
          </div>
        )}
        {conversationId && !state.selected && state.list.isSuccess && (
          <div className={styles.state}>
            <p>{t('unavailable')}</p>
            <Button variant="secondary" onClick={state.close}>
              {t('backToList')}
            </Button>
          </div>
        )}
        {state.selected && state.user.data && (
          <>
            <div className={styles.chatHeading}>
              <button
                type="button"
                className={styles.back}
                onClick={state.close}
                aria-label={t('backToList')}
              >
                <ArrowLeft size={18} />
              </button>
              <strong>
                {state.selected.otherUser.firstName}{' '}
                {state.selected.otherUser.lastName}
              </strong>
              <PresenceIndicator status={state.selected.otherUser.status} />
            </div>
            <ActiveConversation
              key={`${workspaceId}:${state.selected.id}`}
              workspaceId={workspaceId}
              conversation={state.selected}
              currentUserId={state.user.data.id}
            />
          </>
        )}
      </section>
    </div>
  );
}
