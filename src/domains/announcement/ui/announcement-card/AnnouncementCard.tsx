'use client';

import { Menu } from '@mantine/core';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { IconButton } from '@/shared/ui/icon-button';

import type { Announcement } from '../../model/announcements';
import styles from './AnnouncementCard.module.scss';

// ==================== TYPES ====================

interface AnnouncementCardProps {
  announcement: Announcement;
  authorName: string;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// ==================== COMPONENT ====================

export function AnnouncementCard({
  announcement,
  authorName,
  onOpen,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  // ==================== CONTEXT ====================

  const t = useTranslations('announcement');
  const locale = useLocale();

  // ==================== DERIVED STATE ====================

  const scheduled = !announcement.publishedAt;
  const date = announcement.publishedAt ?? announcement.publishAt;

  // ==================== RENDER ====================

  return (
    <article className={styles.card}>
      <div className={styles.body}>
        <h2>
          <button type="button" onClick={onOpen}>
            {announcement.title}
          </button>
        </h2>
        <p className={styles.excerpt}>{announcement.content}</p>
        <div className={styles.meta}>
          <span>{t('by', { name: authorName })}</span>
          {date && (
            <time dateTime={date}>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(date))}
            </time>
          )}
        </div>
      </div>
      <div className={styles.trailing}>
        <span className={scheduled ? styles.scheduled : styles.published}>
          {scheduled ? t('scheduled') : t('published')}
        </span>
        {onEdit && onDelete && (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Ellipsis size={16} />}
                aria-label={t('moreActions', { title: announcement.title })}
              />
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Pencil size={16} />} onClick={onEdit}>
                {t('edit')}
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={onDelete}
              >
                {t('delete')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </div>
    </article>
  );
}
