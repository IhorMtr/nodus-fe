'use client';

import { Menu } from '@mantine/core';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { IconButton } from '@/shared/ui/icon-button';

import type { Message } from '../../model/message-history';

import { MessageEditForm } from './MessageEditForm';
import styles from './MessageItem.module.scss';

// ==================== TYPES ====================

type MessageItemProps = {
  message: Message;
  formatTime: (isoDate: string) => string;
  canEdit: boolean;
  canDelete: boolean;
  isEditing: boolean;
  isSaving: boolean;
  editError?: string;
  onEdit: (messageId: string) => void;
  onSave: (content: string) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: (message: Message) => void;
};

// ==================== HELPERS ====================

function getInitials({ firstName, lastName }: Message['author']) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// The API has no edited flag, so a later updatedAt is the only signal.
function isEdited({ createdAt, updatedAt }: Message) {
  return Date.parse(updatedAt) - Date.parse(createdAt) > 1000;
}

// ==================== COMPONENT ====================

export function MessageItem({
  message,
  formatTime,
  canEdit,
  canDelete,
  isEditing,
  isSaving,
  editError,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
}: MessageItemProps) {
  const t = useTranslations('message');
  const { author } = message;
  const name = `${author.firstName} ${author.lastName}`.trim();
  const hasActions = !isEditing && (canEdit || canDelete);

  return (
    <article className={styles.item} data-editing={isEditing || undefined}>
      <span className={styles.avatar} aria-hidden="true">
        {getInitials(author)}
      </span>
      <div className={styles.body}>
        <header className={styles.meta}>
          <strong className={styles.author} title={name}>
            {name}
          </strong>
          <time className={styles.time} dateTime={message.createdAt}>
            {formatTime(message.createdAt)}
          </time>
          {isEdited(message) && (
            <span
              className={styles.edited}
              title={formatTime(message.updatedAt)}
            >
              {t('meta.edited')}
            </span>
          )}
        </header>
        {isEditing ? (
          <MessageEditForm
            initialContent={message.content}
            onSave={onSave}
            onCancel={onCancelEdit}
            isSaving={isSaving}
            error={editError}
          />
        ) : (
          <p className={styles.content}>{message.content}</p>
        )}
      </div>
      {hasActions && (
        <div className={styles.actions}>
          <Menu position="bottom-end" shadow="sm" withinPortal>
            <Menu.Target>
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Ellipsis size={16} />}
                aria-label={t('actions.more')}
              />
            </Menu.Target>
            <Menu.Dropdown className={styles.dropdown}>
              {canEdit && (
                <Menu.Item
                  leftSection={<Pencil size={16} />}
                  onClick={() => onEdit(message.id)}
                >
                  {t('actions.edit')}
                </Menu.Item>
              )}
              {canDelete && (
                <Menu.Item
                  color="red"
                  leftSection={<Trash2 size={16} />}
                  onClick={() => onDelete(message)}
                >
                  {t('actions.delete')}
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </div>
      )}
    </article>
  );
}
