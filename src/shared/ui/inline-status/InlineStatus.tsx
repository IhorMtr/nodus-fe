import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { AriaRole, ReactNode } from 'react';

import styles from './InlineStatus.module.scss';

// ==================== TYPES ====================

type InlineStatusTone = 'info' | 'success' | 'warning' | 'danger';

type InlineStatusProps = {
  tone: InlineStatusTone;
  children: ReactNode;
  variant?: 'banner' | 'plain';
  icon?: ReactNode;
  action?: ReactNode;
  role?: AriaRole;
  title?: string;
  className?: string;
};

// ==================== CONSTANTS ====================

const TONE_ICONS = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
} as const;

// ==================== COMPONENT ====================

export function InlineStatus({
  tone,
  children,
  variant = 'banner',
  icon,
  action,
  role,
  title,
  className,
}: InlineStatusProps) {
  const ToneIcon = TONE_ICONS[tone];

  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      data-tone={tone}
      data-variant={variant}
      role={role}
      title={title}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon ?? <ToneIcon />}
      </span>
      <span className={styles.message}>{children}</span>
      {action && <span className={styles.action}>{action}</span>}
    </div>
  );
}
