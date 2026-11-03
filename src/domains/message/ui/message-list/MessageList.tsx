'use client';

import { isToday } from 'date-fns';
import { Hash } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Spinner } from '@/shared/ui/spinner';

import type { Message } from '../../model/message-history';
import { MessageItem, type ReceiptDisplay } from '../message-item';

import styles from './MessageList.module.scss';

// ==================== TYPES ====================

type DisplayMessage = Omit<Message, 'channelId'>;

type MessageListProps<T extends DisplayMessage> = {
  channelName: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  messages: T[];
  canEdit: (message: T) => boolean;
  canDelete: (message: T) => boolean;
  getReceipt: (message: T) => ReceiptDisplay | undefined;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  hasOlderError: boolean;
  onLoadOlder: () => void;
  hasNewer?: boolean;
  isLoadingNewer?: boolean;
  hasNewerError?: boolean;
  onLoadNewer?: () => void;
  followLatest?: boolean;
  targetRequest?: { messageId: string; sequence: number };
  scrollToMessageId?: string;
  editingId: string | null;
  isSavingEdit: boolean;
  editError?: string;
  onEdit: (messageId: string) => void;
  onSaveEdit: (content: string) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: (message: T) => void;
  onBottomChange?: (isAtBottom: boolean) => void;
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
const LOAD_NEWER_THRESHOLD = 300;
const BOTTOM_THRESHOLD = 80;
const HIGHLIGHT_DURATION_MS = 1800;

// ==================== HELPERS ====================

function captureScroll(
  element: HTMLElement,
  messages: DisplayMessage[]
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

export function MessageList<T extends DisplayMessage>({
  channelName,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  messages,
  canEdit,
  canDelete,
  getReceipt,
  hasOlder,
  isLoadingOlder,
  hasOlderError,
  onLoadOlder,
  hasNewer = false,
  isLoadingNewer = false,
  hasNewerError = false,
  onLoadNewer,
  followLatest = true,
  targetRequest,
  scrollToMessageId,
  editingId,
  isSavingEdit,
  editError,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onBottomChange,
}: MessageListProps<T>) {
  // ==================== CONTEXT AND REFS ====================

  const t = useTranslations('message');
  const locale = useLocale();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<ScrollSnapshot | null>(null);
  const handledScrollTargetRef = useRef<string | undefined>(undefined);
  const reportedBottomRef = useRef<boolean | null>(null);
  const handledTargetSequenceRef = useRef<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

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
  const canLoadNewer = hasNewer && !isLoadingNewer && !hasNewerError;

  // ==================== SCROLL POSITION ====================

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

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
      if (followLatest) {
        scroller.scrollTop = scroller.scrollHeight;
      }
    } else if (
      firstId !== previous.firstId &&
      messages.some(message => message.id === previous.firstId)
    ) {
      scroller.scrollTop =
        previous.top + (scroller.scrollHeight - previous.height);
    } else if (
      followLatest &&
      lastId !== previous.lastId &&
      previous.isAtBottom
    ) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [messages, scrollToMessageId, followLatest]);

  // ==================== TARGET NAVIGATION ====================

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !targetRequest) {
      return;
    }

    if (handledTargetSequenceRef.current === targetRequest.sequence) {
      return;
    }

    const item = Array.from(
      scroller.querySelectorAll<HTMLElement>('[data-message-id]')
    ).find(element => element.dataset.messageId === targetRequest.messageId);
    if (!item) {
      return;
    }

    handledTargetSequenceRef.current = targetRequest.sequence;
    const scrollerBounds = scroller.getBoundingClientRect();
    const itemBounds = item.getBoundingClientRect();
    scroller.scrollTop +=
      itemBounds.top -
      scrollerBounds.top -
      (scroller.clientHeight - itemBounds.height) / 2;
    setHighlightedId(targetRequest.messageId);
  }, [messages, targetRequest]);

  useEffect(() => {
    if (!highlightedId) {
      return;
    }

    const timeout = window.setTimeout(
      () => setHighlightedId(null),
      HIGHLIGHT_DURATION_MS
    );
    return () => window.clearTimeout(timeout);
  }, [highlightedId, targetRequest?.sequence]);

  // ==================== BOTTOM POSITION ====================

  function reportBottom(snapshot: ScrollSnapshot) {
    if (!onBottomChange || snapshot.isAtBottom === reportedBottomRef.current) {
      return;
    }

    reportedBottomRef.current = snapshot.isAtBottom;
    onBottomChange(snapshot.isAtBottom);
  }

  useLayoutEffect(() => {
    if (scrollerRef.current) {
      snapshotRef.current = captureScroll(scrollerRef.current, messages);
      reportBottom(snapshotRef.current);
    }
  });

  // ==================== HISTORY LOADING ====================

  function loadOlderIfNeeded() {
    const scroller = scrollerRef.current;
    if (canLoadOlder && scroller && scroller.scrollTop < LOAD_OLDER_THRESHOLD) {
      onLoadOlder();
    }
  }

  function loadNewerIfNeeded() {
    const scroller = scrollerRef.current;
    if (!canLoadNewer || !scroller || !onLoadNewer) {
      return;
    }

    const distance =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    if (distance < LOAD_NEWER_THRESHOLD) {
      onLoadNewer();
    }
  }

  useEffect(() => {
    loadOlderIfNeeded();
    loadNewerIfNeeded();
  });

  function handleScroll() {
    if (scrollerRef.current) {
      snapshotRef.current = captureScroll(scrollerRef.current, messages);
      reportBottom(snapshotRef.current);
    }

    loadOlderIfNeeded();
    loadNewerIfNeeded();
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
              <span className={styles.emptyIcon} aria-hidden="true">
                {emptyIcon ?? <Hash size={24} />}
              </span>
              <strong>
                {emptyTitle ?? t('states.empty', { channel: channelName })}
              </strong>
              <p>{emptyDescription ?? t('states.emptyDescription')}</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {messages.map(message => {
                const isEditing = message.id === editingId;

                return (
                  <li
                    key={message.id}
                    data-message-id={message.id}
                    data-highlighted={highlightedId === message.id || undefined}
                    className={styles.messageRow}
                  >
                    <MessageItem
                      message={message}
                      formatTime={formatTime}
                      receipt={getReceipt(message)}
                      canEdit={canEdit(message)}
                      canDelete={canDelete(message)}
                      isEditing={isEditing}
                      isSaving={isEditing && isSavingEdit}
                      editError={isEditing ? editError : undefined}
                      onEdit={onEdit}
                      onSave={onSaveEdit}
                      onCancelEdit={onCancelEdit}
                      onDelete={() => onDelete(message)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      {isLoadingOlder && (
        <div className={styles.status}>
          <Spinner size="sm" label={t('states.loadingOlder')} />
        </div>
      )}
      {hasOlderError && (
        <div className={styles.status} role="alert">
          <InlineStatus tone="danger" variant="plain">
            {t('states.olderLoadError')}
          </InlineStatus>
          <Button variant="secondary" size="sm" onClick={onLoadOlder}>
            {t('actions.retry')}
          </Button>
        </div>
      )}
      {isLoadingNewer && (
        <div className={`${styles.status} ${styles.newerStatus}`}>
          <Spinner size="sm" label={t('states.loadingNewer')} />
        </div>
      )}
      {hasNewerError && onLoadNewer && (
        <div className={`${styles.status} ${styles.newerStatus}`} role="alert">
          <InlineStatus tone="danger" variant="plain">
            {t('states.newerLoadError')}
          </InlineStatus>
          <Button variant="secondary" size="sm" onClick={onLoadNewer}>
            {t('actions.retry')}
          </Button>
        </div>
      )}
    </div>
  );
}
