'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';
import { Button } from '@/shared/ui/button';

import styles from './NotFoundView.module.scss';

export function NotFoundView() {
  const product = useTranslations('product');
  const t = useTranslations('common.notFound');

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          {product('name')}
        </Link>
      </header>
      <main className={styles.main}>
        <p className={styles.code} aria-hidden="true">
          {t('code')}
        </p>
        <h1>{t('title')}</h1>
        <p className={styles.description}>{t('description')}</p>
        <div className={styles.actions}>
          <Button
            renderRoot={props => <Link {...props} type={undefined} href="/" />}
          >
            {t('home')}
          </Button>
          <Button
            variant="secondary"
            renderRoot={props => (
              <Link {...props} type={undefined} href="/app" />
            )}
          >
            {t('app')}
          </Button>
        </div>
      </main>
    </div>
  );
}
