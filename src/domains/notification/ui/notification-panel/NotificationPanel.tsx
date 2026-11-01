'use client';

import { Check, Inbox } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { Notification } from '../../model/notifications';
import styles from './NotificationPanel.module.scss';

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
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className={styles.panel} aria-label={t('title')}>
      {/* ==================== PANEL HEADER ==================== */}

      <div className={styles.header}>
        <div>
          <h2>{t('title')}</h2>
          <p>{t('subtitle')}</p>
        </div>
        <button
          className={styles.markAll}
          type="button"
          onClick={props.onMarkAllRead}
          disabled={props.markingAll || !props.canMarkAll}
        >
          <Check size={15} aria-hidden="true" />
          {t('markAllRead')}
        </button>
      </div>

      {/* ==================== FEEDBACK STATES ==================== */}

      {props.actionError && (
        <p className={styles.error} role="alert">
          {t('actionError')}
        </p>
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
                  <time dateTime={item.createdAt}>
                    {Number.isNaN(date.getTime())
                      ? item.createdAt
                      : formatter.format(date)}
                  </time>
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
        <p className={styles.error} role="alert">
          {t('loadMoreError')}
        </p>
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
