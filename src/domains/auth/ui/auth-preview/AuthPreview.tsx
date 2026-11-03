import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import styles from './AuthPreview.module.scss';

// ==================== TYPES ====================

type AuthPreviewProps = {
  children: ReactNode;
};

// ==================== RENDER ====================

export function AuthPreview({ children }: AuthPreviewProps) {
  const auth = useTranslations('auth');

  return (
    <div className={styles.root}>
      <div className={styles.caption}>
        <h2>{auth('preview.title')}</h2>
        <p>{auth('preview.description')}</p>
      </div>
      <div className={styles.media}>{children}</div>
    </div>
  );
}
