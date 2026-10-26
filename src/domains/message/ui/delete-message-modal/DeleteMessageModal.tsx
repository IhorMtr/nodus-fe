'use client';

import { Modal } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';

import styles from './DeleteMessageModal.module.scss';

type DeleteMessageModalProps = {
  opened: boolean;
  isDeleting: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
};

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
      classNames={{
        content: styles.content,
        header: styles.header,
        title: styles.title,
      }}
    >
      <p className={styles.description}>{t('deletion.description')}</p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
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
