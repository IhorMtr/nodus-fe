'use client';

import { useTranslations } from 'next-intl';

import type { PresenceStatus } from '../../model/presence-status';
import styles from './PresenceIndicator.module.scss';

// ==================== TYPES ====================

interface PresenceIndicatorProps {
  status: PresenceStatus;
  withLabel?: boolean;
  className?: string;
}

// ==================== RENDER ====================

export function PresenceIndicator({
  status,
  withLabel = true,
  className,
}: PresenceIndicatorProps) {
  const t = useTranslations('presence.status');
  const label = t(status);

  if (!withLabel) {
    return (
      <span
        className={`${styles.dot} ${className ?? ''}`}
        data-status={status}
        role="img"
        aria-label={label}
        title={label}
      />
    );
  }

  return (
    <span className={`${styles.indicator} ${className ?? ''}`}>
      <span className={styles.dot} data-status={status} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
