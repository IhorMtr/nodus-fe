import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Link } from '@/shared/i18n/navigation';

import { AuthPreview } from '../auth-preview';

import styles from './AuthLayout.module.scss';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const product = useTranslations('product');
  const auth = useTranslations('auth');

  return (
    <main className={styles.root}>
      <div className={styles.formPanel}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
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
      </div>
      <aside className={styles.previewPanel}>
        <AuthPreview />
      </aside>
    </main>
  );
}
