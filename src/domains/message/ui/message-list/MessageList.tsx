'use client';

import { isToday } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import type { Message } from '../../model/message-history';
import {
  canDeleteMessage,
  canEditMessage,
} from '../../model/message-permissions';
import { MessageItem } from '../message-item';

import styles from './MessageList.module.scss';

// ==================== TYPES ====================

type MessageListProps = {
  // Chronological order: the oldest message first.
  messages: Message[];
  currentUserId: string;
  canModerate: boolean;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  hasOlderError: boolean;
  onLoadOlder: () => void;
  // Scrolls to the end once this message is rendered, e.g. after sending it.
  scrollToMessageId?: string;
  editingId: string | null;
  isSavingEdit: boolean;
  editError?: string;
  onEdit: (messageId: string) => void;
  onSaveEdit: (content: string) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: (message: Message) => void;
};

type ScrollSnapshot = {
  firstId?: string;
  lastId?: string;
  height: number;
  top: number;
  isAtBottom: boolean;
};

// ==================== CONSTANTS ====================

const LOAD_OLDER_THRESHOLD = 300;
const BOTTOM_THRESHOLD = 80;

// ==================== HELPERS ====================

function captureScroll(
  element: HTMLElement,
  messages: Message[]
): ScrollSnapshot {
  return {
    firstId: messages[0]?.id,
    lastId: messages.at(-1)?.id,
    height: element.scrollHeight,
    top: element.scrollTop,
    isAtBottom:
      element.scrollHeight - element.scrollTop - element.clientHeight <
      BOTTOM_THRESHOLD,
  };
}

// ==================== COMPONENT ====================

export function MessageList({
  messages,
  currentUserId,
  canModerate,
  hasOlder,
  isLoadingOlder,
  hasOlderError,
  onLoadOlder,
  scrollToMessageId,
  editingId,
  isSavingEdit,
  editError,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: MessageListProps) {
  const t = useTranslations('message');
  const locale = useLocale();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<ScrollSnapshot | null>(null);
  const handledScrollTargetRef = useRef<string | undefined>(undefined);

  // ==================== DERIVED STATE ====================

  const formatTime = useMemo(() => {
    const time = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateTime = new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    return (isoDate: string) => {
      const date = new Date(isoDate);
      return (isToday(date) ? time : dateTime).format(date);
    };
  }, [locale]);

  const canLoadOlder = hasOlder && !isLoadingOlder && !hasOlderError;

  // ==================== SCROLL POSITION ====================

  // Runs only when the list content changes and compares it with the layout
  // captured after the previous render.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const previous = snapshotRef.current;
    const firstId = messages[0]?.id;
    const lastId = messages.at(-1)?.id;
    const shouldScrollToTarget =
      scrollToMessageId !== undefined &&
      scrollToMessageId !== handledScrollTargetRef.current &&
      messages.some(message => message.id === scrollToMessageId);

    if (shouldScrollToTarget) {
      handledScrollTargetRef.current = scrollToMessageId;
      scroller.scrollTop = scroller.scrollHeight;
    } else if (!previous) {
      // First render of a channel starts at the latest messages.
      scroller.scrollTop = scroller.scrollHeight;
    } else if (
      firstId !== previous.firstId &&
      messages.some(message => message.id === previous.firstId)
    ) {
      // Older history was prepended: keep the same messages in view.
      scroller.scrollTop =
        previous.top + (scroller.scrollHeight - previous.height);
    } else if (lastId !== previous.lastId && previous.isAtBottom) {
      // Readers at the bottom keep following new messages; others stay put.
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [messages, scrollToMessageId]);

  // Runs after every render so edits and other height changes never leave a
  // stale snapshot behind.
  useLayoutEffect(() => {
    if (scrollerRef.current) {
      snapshotRef.current = captureScroll(scrollerRef.current, messages);
    }
  });

  // ==================== HISTORY LOADING ====================

  function loadOlderIfNeeded() {
    const scroller = scrollerRef.current;
    if (canLoadOlder && scroller && scroller.scrollTop < LOAD_OLDER_THRESHOLD) {
      onLoadOlder();
    }
  }

  // Also covers history that is too short to scroll at all.
  useEffect(() => {
    loadOlderIfNeeded();
  });

  function handleScroll() {
    if (scrollerRef.current) {
      snapshotRef.current = captureScroll(scrollerRef.current, messages);
    }
    loadOlderIfNeeded();
  }

  // ==================== RENDER ====================

  return (
    <div className={styles.viewport}>
      <div
        ref={scrollerRef}
        className={styles.scroller}
        onScroll={handleScroll}
        tabIndex={0}
        aria-label={t('list.label')}
        role="region"
      >
        <div className={styles.inner}>
          {messages.length === 0 && !hasOlder ? (
            <div className={styles.empty}>
              <strong>{t('states.empty')}</strong>
              <p>{t('states.emptyDescription')}</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {messages.map(message => {
                const isEditing = message.id === editingId;

                return (
                  <li key={message.id}>
                    <MessageItem
                      message={message}
                      formatTime={formatTime}
                      canEdit={canEditMessage(message, currentUserId)}
                      canDelete={canDeleteMessage(
                        message,
                        currentUserId,
                        canModerate
                      )}
                      isEditing={isEditing}
                      isSaving={isEditing && isSavingEdit}
                      editError={isEditing ? editError : undefined}
                      onEdit={onEdit}
                      onSave={onSaveEdit}
                      onCancelEdit={onCancelEdit}
                      onDelete={onDelete}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      {/* Overlaid so showing it never shifts the messages underneath. */}
      {isLoadingOlder && (
        <div className={styles.status}>
          <Spinner size="sm" label={t('states.loadingOlder')} />
        </div>
      )}
      {hasOlderError && (
        <div className={styles.status} role="alert">
          <span>{t('states.olderLoadError')}</span>
          <Button variant="secondary" size="sm" onClick={onLoadOlder}>
            {t('actions.retry')}
          </Button>
        </div>
      )}
    </div>
  );
}
