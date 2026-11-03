import type { ReactNode } from 'react';

import styles from './Avatar.module.scss';

// ==================== TYPES ====================

interface AvatarProps {
  initials: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  status?: ReactNode;
  className?: string;
}

// ==================== RENDER ====================

export function Avatar({
  initials,
  size = 'md',
  shape = 'circle',
  status,
  className,
}: AvatarProps) {
  return (
    <span
      className={`${styles.avatar} ${className ?? ''}`}
      data-size={size}
      data-shape={shape}
    >
      <span className={styles.initials} aria-hidden="true">
        {initials}
      </span>
      {status && <span className={styles.status}>{status}</span>}
    </span>
  );
}
