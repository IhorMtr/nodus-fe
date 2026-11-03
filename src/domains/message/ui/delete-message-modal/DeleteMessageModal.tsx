'use client';

import { Modal } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';

import styles from './DeleteMessageModal.module.scss';

// ==================== TYPES ====================

type DeleteMessageModalProps = {
  opened: boolean;
  isDeleting: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
};

// ==================== RENDER ====================

export function DeleteMessageModal({
  opened,
  isDeleting,
  error,
  onConfirm,
  onClose,
}: DeleteMessageModalProps) {
  const t = useTranslations('message');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('deletion.title')}
      size="sm"
      centered
      closeOnClickOutside={!isDeleting}
      closeOnEscape={!isDeleting}
      withCloseButton={!isDeleting}
    >
      <p className={styles.description}>{t('deletion.description')}</p>
      {error && (
        <InlineStatus tone="danger" role="alert" className={styles.error}>
          {error}
        </InlineStatus>
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          loading={isDeleting}
          disabled={isDeleting}
        >
          {t('actions.delete')}
        </Button>
      </div>
    </Modal>
  );
}
