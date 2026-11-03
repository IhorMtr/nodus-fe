'use client';

import { Menu } from '@mantine/core';
import { Clock, Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Avatar, getNameInitials } from '@/shared/ui/avatar';
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
  const date =
    announcement.publishedAt ??
    announcement.publishAt ??
    announcement.createdAt;
  const parsedDate = new Date(date);
  const month = new Intl.DateTimeFormat(locale, { month: 'short' }).format(
    parsedDate
  );
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(
    parsedDate
  );
  const fullDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsedDate);
  const canManage = Boolean(onEdit && onDelete);

  // ==================== RENDER ====================

  return (
    <article className={styles.card} data-scheduled={scheduled || undefined}>
      {/* ==================== DATE TILE ==================== */}

      <time className={styles.dateTile} dateTime={date} aria-hidden="true">
        <span className={styles.month}>{month}</span>
        <span className={styles.day}>{day}</span>
      </time>

      {/* ==================== CONTENT ==================== */}

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h2>
            <button type="button" onClick={onOpen}>
              {announcement.title}
            </button>
          </h2>
          <span className={styles.status}>
            {scheduled && <Clock size={12} aria-hidden="true" />}
            {scheduled ? t('scheduled') : t('published')}
          </span>
        </div>

        <p className={styles.excerpt}>{announcement.content}</p>

        <div className={styles.meta}>
          <Avatar initials={getNameInitials(authorName)} size="xs" />
          <span>{t('by', { name: authorName })}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={date}>{fullDate}</time>
        </div>
      </div>

      {/* ==================== ACTIONS ==================== */}

      {canManage && (
        <div className={styles.actions}>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Ellipsis />}
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
        </div>
      )}
    </article>
  );
}
