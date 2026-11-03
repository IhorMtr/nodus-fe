'use client';

import { isToday } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';

import type { Conversation } from '@/domains/conversation/model/conversations';
import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import { Avatar } from '@/shared/ui/avatar';

import styles from './ConversationRow.module.scss';

// ==================== TYPES ====================

interface ConversationRowProps {
  conversation: Conversation;
  currentUserId?: string;
  active: boolean;
  onOpen: () => void;
}

// ==================== CONSTANTS ====================

const MAX_VISIBLE_UNREAD = 99;

// ==================== HELPERS ====================

function formatActivity(locale: string, isoDate: string) {
  const date = new Date(isoDate);
  const options: Intl.DateTimeFormatOptions = isToday(date)
    ? { hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'short' };

  return new Intl.DateTimeFormat(locale, options).format(date);
}

// ==================== RENDER ====================

export function ConversationRow({
  conversation,
  currentUserId,
  active,
  onOpen,
}: ConversationRowProps) {
  // ==================== DERIVED STATE ====================

  const t = useTranslations('conversation');
  const locale = useLocale();
  const person = conversation.otherUser;
  const name = `${person.firstName} ${person.lastName}`.trim();
  const initials =
    `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`.toUpperCase();
  const last = conversation.lastMessage;
  const isOwnLast = Boolean(last && last.author.id === currentUserId);
  const time = last ? formatActivity(locale, last.createdAt) : '';
  const unreadLabel =
    conversation.unreadCount > MAX_VISIBLE_UNREAD
      ? `${MAX_VISIBLE_UNREAD}+`
      : conversation.unreadCount;

  return (
    <li>
      <button
        type="button"
        className={styles.row}
        data-unread={conversation.hasUnread || undefined}
        onClick={onOpen}
        aria-current={active ? 'page' : undefined}
      >
        {/* ==================== IDENTITY ==================== */}

        <Avatar
          initials={initials}
          size="lg"
          className={styles.avatar}
          status={
            <PresenceIndicator status={person.status} withLabel={false} />
          }
        />

        {/* ==================== SUMMARY ==================== */}

        <span className={styles.body}>
          <span className={styles.top}>
            <strong className={styles.name}>{name}</strong>
            {last && (
              <time className={styles.time} dateTime={last.createdAt}>
                {time}
              </time>
            )}
          </span>

          <span className={styles.bottom}>
            <span className={styles.preview}>
              {isOwnLast && (
                <span className={styles.previewAuthor}>{t('you')}: </span>
              )}
              {last?.content ?? t('noMessages')}
            </span>
            {conversation.unreadCount > 0 && (
              <span
                className={styles.unread}
                aria-label={t('unread', { count: conversation.unreadCount })}
              >
                {unreadLabel}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}
