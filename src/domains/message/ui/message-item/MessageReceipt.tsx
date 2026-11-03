'use client';

import { Popover } from '@mantine/core';
import { Check, CheckCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { MessageAuthor } from '../../model/message-history';

import styles from './MessageItem.module.scss';

// ==================== TYPES ====================

export type ReceiptDisplay = {
  read: boolean;
  readers?: MessageAuthor[];
};

// ==================== COMPONENT ====================

export function MessageReceipt({ receipt }: { receipt: ReceiptDisplay }) {
  const t = useTranslations('message.meta');
  const [opened, setOpened] = useState(false);
  const readers = receipt.readers ?? [];

  if (!receipt.read || readers.length === 0) {
    return (
      <span
        className={styles.receipt}
        role="img"
        aria-label={t(receipt.read ? 'read' : 'sent')}
      >
        {receipt.read ? <CheckCheck size={15} /> : <Check size={15} />}
      </span>
    );
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom"
      shadow="sm"
      withinPortal
    >
      <Popover.Target>
        <button
          type="button"
          className={styles.receiptButton}
          aria-label={t('readBy', { count: readers.length })}
          onMouseEnter={() => setOpened(true)}
          onMouseLeave={() => setOpened(false)}
          onFocus={() => setOpened(true)}
          onBlur={() => setOpened(false)}
          onClick={() => setOpened(true)}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              setOpened(false);
            }
          }}
        >
          <CheckCheck size={15} aria-hidden="true" />
        </button>
      </Popover.Target>
      <Popover.Dropdown className={styles.receiptPopover}>
        <strong>{t('readBy', { count: readers.length })}</strong>
        <ul>
          {readers.map(reader => (
            <li key={reader.id}>
              {`${reader.firstName} ${reader.lastName}`.trim()}
            </li>
          ))}
        </ul>
      </Popover.Dropdown>
    </Popover>
  );
}
