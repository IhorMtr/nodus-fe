'use client';

import { useLocale, useTranslations } from 'next-intl';

import type { Announcement } from '../../model/announcements';
import styles from './AnnouncementCard.module.scss';

// ==================== TYPES ====================

interface AnnouncementCardProps {
  announcement: Announcement;
  authorName: string;
  onOpen: () => void;
}

// ==================== RENDER ====================

export function AnnouncementCard({
  announcement,
  authorName,
  onOpen,
}: AnnouncementCardProps) {
  const t = useTranslations('announcement');
  const locale = useLocale();
  const scheduled = !announcement.publishedAt;
  const date = announcement.publishedAt ?? announcement.publishAt;

  return (
    <article className={styles.card}>
      <div className={styles.meta}>
        <span className={scheduled ? styles.scheduled : styles.published}>
          {scheduled ? t('scheduled') : t('published')}
        </span>
        {date && (
          <time dateTime={date}>
            {new Intl.DateTimeFormat(locale, {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(date))}
          </time>
        )}
      </div>
      <h2>
        <button type="button" onClick={onOpen}>
          {announcement.title}
        </button>
      </h2>
      <p className={styles.excerpt}>{announcement.content}</p>
      <span className={styles.author}>{t('by', { name: authorName })}</span>
    </article>
  );
}
