import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Link } from '@/shared/i18n/navigation';

import styles from './AuthLayout.module.scss';

// ==================== TYPES ====================

type AuthLayoutProps = {
  children: ReactNode;
  preview: ReactNode;
};

// ==================== RENDER ====================

export function AuthLayout({ children, preview }: AuthLayoutProps) {
  const product = useTranslations('product');
  const auth = useTranslations('auth');

  return (
    <main className={styles.root}>
      {/* ==================== FORM PANEL ==================== */}

      <div className={styles.formPanel}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              N
            </span>
            {product('name')}
          </Link>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{auth('experience.backHome')}</span>
          </Link>
        </header>

        <div className={styles.formArea}>
          <div className={styles.formContent}>{children}</div>
        </div>

        <footer className={styles.footer}>
          {product('copyright', { year: new Date().getFullYear() })}
        </footer>
      </div>

      {/* ==================== PRODUCT PREVIEW ==================== */}

      <aside className={styles.previewPanel}>{preview}</aside>
    </main>
  );
}
