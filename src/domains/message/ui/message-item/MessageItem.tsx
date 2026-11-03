'use client';

import { Tooltip } from '@mantine/core';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Avatar } from '@/shared/ui/avatar';
import { IconButton } from '@/shared/ui/icon-button';

import type { Message } from '../../model/message-history';

import { MessageEditForm } from './MessageEditForm';
import { MessageReceipt, type ReceiptDisplay } from './MessageReceipt';
import styles from './MessageItem.module.scss';

// ==================== TYPES ====================

type MessageItemProps = {
  message: Omit<Message, 'channelId'>;
  grouped: boolean;
  formatTime: (isoDate: string) => string;
  formatDateTime: (isoDate: string) => string;
  receipt?: ReceiptDisplay;
  canEdit: boolean;
  canDelete: boolean;
  isEditing: boolean;
  isSaving: boolean;
  editError?: string;
  onEdit: (messageId: string) => void;
  onSave: (content: string) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: (message: Omit<Message, 'channelId'>) => void;
};

// ==================== HELPERS ====================

function getInitials({ firstName, lastName }: Message['author']) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function isEdited({ createdAt, updatedAt }: Omit<Message, 'channelId'>) {
  return Date.parse(updatedAt) - Date.parse(createdAt) > 1000;
}

// ==================== COMPONENT ====================

export function MessageItem({
  message,
  grouped,
  formatTime,
  formatDateTime,
  receipt,
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
  // ==================== DERIVED STATE ====================

  const t = useTranslations('message');
  const { author } = message;
  const name = `${author.firstName} ${author.lastName}`.trim();
  const hasActions = !isEditing && (canEdit || canDelete);
  const edited = isEdited(message);

  const editedLabel = edited && (
    <span className={styles.edited} title={formatDateTime(message.updatedAt)}>
      {t('meta.edited')}
    </span>
  );
  const receiptMark = receipt && <MessageReceipt receipt={receipt} />;

  // ==================== RENDER ====================

  return (
    <article
      className={styles.item}
      data-grouped={grouped || undefined}
      data-editing={isEditing || undefined}
    >
      {/* ==================== GUTTER ==================== */}

      <div className={styles.gutter}>
        {grouped ? (
          <time
            className={styles.hoverTime}
            dateTime={message.createdAt}
            title={formatDateTime(message.createdAt)}
          >
            {formatTime(message.createdAt)}
          </time>
        ) : (
          <Avatar initials={getInitials(author)} size="md" />
        )}
      </div>

      {/* ==================== BODY ==================== */}

      <div className={styles.body}>
        {!grouped && (
          <header className={styles.meta}>
            <strong className={styles.author} title={name}>
              {name}
            </strong>
            <time
              className={styles.time}
              dateTime={message.createdAt}
              title={formatDateTime(message.createdAt)}
            >
              {formatTime(message.createdAt)}
            </time>
            {receiptMark}
            {editedLabel}
          </header>
        )}

        {isEditing && (
          <MessageEditForm
            initialContent={message.content}
            onSave={onSave}
            onCancel={onCancelEdit}
            isSaving={isSaving}
            error={editError}
          />
        )}

        {!isEditing && (
          <p className={styles.content}>
            {message.content}
            {grouped && (edited || receipt) && (
              <span className={styles.trailingMeta}>
                {editedLabel}
                {receiptMark}
              </span>
            )}
          </p>
        )}
      </div>

      {/* ==================== HOVER ACTIONS ==================== */}

      {hasActions && (
        <div
          className={styles.actions}
          role="toolbar"
          aria-label={t('actions.more')}
        >
          {canEdit && (
            <Tooltip label={t('actions.edit')}>
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Pencil />}
                aria-label={t('actions.edit')}
                onClick={() => onEdit(message.id)}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip label={t('actions.delete')}>
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Trash2 />}
                aria-label={t('actions.delete')}
                onClick={() => onDelete(message)}
              />
            </Tooltip>
          )}
        </div>
      )}
    </article>
  );
}
