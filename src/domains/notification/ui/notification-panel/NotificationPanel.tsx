'use client';

import { Check, Inbox } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { Notification } from '../../model/notifications';
import styles from './NotificationPanel.module.scss';
import { InlineStatus } from '@/shared/ui/inline-status';

// ==================== TYPES ====================

interface NotificationPanelProps {
  items: Notification[];
  navigableIds: string[];
  canMarkAll: boolean;
  loading: boolean;
  error: boolean;
  loadingMore: boolean;
  loadMoreError: boolean;
  hasMore: boolean;
  markingAll: boolean;
  markingId: string | null;
  actionError: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onSelect: (notification: Notification) => void;
}

// ==================== RENDER ====================

export function NotificationPanel(props: NotificationPanelProps) {
  const t = useTranslations('notification');
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <section className={styles.panel} aria-label={t('title')}>
      {/* ==================== PANEL HEADER ==================== */}

      <div className={styles.header}>
        <h2>{t('title')}</h2>
        {(props.canMarkAll || props.markingAll) && (
          <button
            className={styles.markAll}
            type="button"
            onClick={props.onMarkAllRead}
            disabled={props.markingAll}
            aria-label={t('markAllRead')}
          >
            <Check size={15} aria-hidden="true" />
            {t('markAllReadShort')}
          </button>
        )}
      </div>

      {/* ==================== FEEDBACK STATES ==================== */}

      {props.actionError && (
        <InlineStatus tone="danger" role="alert" className={styles.error}>
          {t('actionError')}
        </InlineStatus>
      )}
      {props.loading && <p className={styles.feedback}>{t('loading')}</p>}
      {props.error && (
        <div className={styles.feedback} role="alert">
          <p>{t('loadError')}</p>
          <button type="button" onClick={props.onRetry}>
            {t('retry')}
          </button>
        </div>
      )}
      {!props.loading && !props.error && props.items.length === 0 && (
        <div className={styles.empty}>
          <Inbox size={24} aria-hidden="true" />
          <strong>{t('emptyTitle')}</strong>
          <span>{t('emptyDescription')}</span>
        </div>
      )}

      {/* ==================== NOTIFICATIONS LIST ==================== */}

      {props.items.length > 0 && (
        <ul className={styles.list}>
          {props.items.map(item => {
            const canNavigate = props.navigableIds.includes(item.id);
            const date = new Date(item.createdAt);

            return (
              <li
                key={item.id}
                className={`${styles.item} ${!item.readAt ? styles.unread : ''}`}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemTop}>
                    <span className={styles.type}>
                      {t(`types.${item.type}`)}
                    </span>
                    {!item.readAt && (
                      <span className={styles.dot} aria-label={t('unread')} />
                    )}
                    <time dateTime={item.createdAt}>
                      {Number.isNaN(date.getTime())
                        ? item.createdAt
                        : formatter.format(date)}
                    </time>
                  </div>
                  {canNavigate ? (
                    <button
                      type="button"
                      className={styles.itemTitle}
                      onClick={() => props.onSelect(item)}
                    >
                      {item.title}
                    </button>
                  ) : (
                    <strong className={styles.itemTitle}>{item.title}</strong>
                  )}
                  <p>{item.message}</p>
                </div>
                {!item.readAt && (
                  <button
                    type="button"
                    className={styles.markRead}
                    onClick={() => props.onMarkRead(item.id)}
                    disabled={props.markingId === item.id}
                    aria-label={t('markRead')}
                    title={t('markRead')}
                  >
                    <Check size={16} aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ==================== PAGINATION ==================== */}

      {props.loadMoreError && (
        <InlineStatus tone="danger" role="alert" className={styles.error}>
          {t('loadMoreError')}
        </InlineStatus>
      )}
      {props.hasMore && !props.error && (
        <div className={styles.footer}>
          <button
            type="button"
            onClick={props.onLoadMore}
            disabled={props.loadingMore}
          >
            {props.loadingMore ? t('loadingMore') : t('loadMore')}
          </button>
        </div>
      )}
    </section>
  );
}
