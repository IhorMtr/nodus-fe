'use client';

import { MessagesSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Spinner } from '@/shared/ui/spinner';

import { ConversationRow } from './components/ConversationRow';
import { DirectConversation } from './components/DirectConversation';
import { NewConversationMenu } from './components/NewConversationMenu';
import { useConversationsView } from './hooks/use-conversations-view';
import styles from './ConversationsView.module.scss';

// ==================== VIEW ====================

export function ConversationsView({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId?: string;
}) {
  // ==================== PAGE STATE ====================

  const t = useTranslations('conversation');
  const workspace = useTranslations('workspace');
  const state = useConversationsView(workspaceId, conversationId);

  // ==================== DERIVED STATE ====================

  const hasConversations = state.conversations.length > 0;
  const unreadConversations = state.conversations.filter(
    conversation => conversation.hasUnread
  ).length;
  const selectedName = state.selected
    ? `${state.selected.otherUser.firstName} ${state.selected.otherUser.lastName}`
    : t('selectConversation');

  // ==================== HANDLERS ====================

  const startConversation = (userId: string) => {
    void state.start(userId).catch(() => undefined);
  };

  const retryList = () => {
    void state.list.refetch();
  };

  const newConversationMenu = (variant: 'primary' | 'secondary') => (
    <NewConversationMenu
      variant={variant}
      members={state.availableMembers}
      loading={state.members.isPending}
      error={state.members.isError}
      ready={state.members.isSuccess}
      disabled={state.open.isPending}
      onRetry={() => void state.members.refetch()}
      onSelect={startConversation}
    />
  );

  // ==================== RENDER ====================

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
        <h1 className={styles.title}>
          {workspace('navigation.conversations')}
        </h1>

        {hasConversations && (
          <div className={styles.toolbar}>
            <p className={styles.summary}>
              <span>{t('summary', { count: state.conversations.length })}</span>
              {unreadConversations > 0 && (
                <span className={styles.summaryUnread}>
                  {t('unreadSummary', { count: unreadConversations })}
                </span>
              )}
            </p>
            {newConversationMenu('secondary')}
          </div>
        )}

        {state.open.isError && (
          <div className={styles.listFeedback}>
            <InlineStatus tone="danger" role="alert">
              {t('openError')}
            </InlineStatus>
          </div>
        )}

        {/* ==================== LIST STATES ==================== */}

        {state.list.isPending && (
          <div className={styles.state}>
            <Spinner label={t('loading')} />
          </div>
        )}

        {state.list.isError && !state.list.data && (
          <div className={styles.state}>
            <p>{t('listError')}</p>
            <Button variant="secondary" onClick={retryList}>
              {workspace('actions.retry')}
            </Button>
          </div>
        )}

        {state.list.isSuccess && !hasConversations && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <MessagesSquare size={22} />
            </span>
            <h2>{t('emptyList')}</h2>
            <p>{t('emptyListDescription')}</p>
            {newConversationMenu('primary')}
          </div>
        )}

        {/* ==================== ROWS ==================== */}

        {hasConversations && (
          <ul className={styles.rows}>
            {state.conversations.map(conversation => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                currentUserId={state.user.data?.id}
                active={conversation.id === conversationId}
                onOpen={() => state.navigate(conversation.id)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* ==================== OPEN CONVERSATION ==================== */}

      <section className={styles.chatPane} aria-label={selectedName}>
        {conversationId && state.list.isPending && (
          <div className={styles.state}>
            <Spinner label={t('loading')} />
          </div>
        )}

        {conversationId && state.list.isError && !state.list.data && (
          <div className={styles.state}>
            <p>{t('listError')}</p>
            <Button variant="secondary" onClick={retryList}>
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
          <DirectConversation
            key={`${workspaceId}:${state.selected.id}`}
            workspaceId={workspaceId}
            conversation={state.selected}
            currentUserId={state.user.data.id}
          />
        )}
      </section>
    </div>
  );
}
