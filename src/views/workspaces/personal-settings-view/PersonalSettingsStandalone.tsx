'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';

import { PersonalSettingsView } from './PersonalSettingsView';
import styles from './PersonalSettingsView.module.scss';

// ==================== STANDALONE PAGE ====================

export function PersonalSettingsStandalone({
  workspaceId,
}: {
  workspaceId: string;
}) {
  // ==================== CONTEXT ====================

  const t = useTranslations('user.settings');
  const product = useTranslations('product');

  // ==================== RENDER ====================

  return (
    <div className={styles.standalone}>
      {/* ==================== PAGE HEADER ==================== */}

      <header className={styles.standaloneHeader}>
        <div className={styles.headerInner}>
          <Link href="/app" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              N
            </span>
            {product('name')}
          </Link>
          <Link
            href={{
              pathname: '/workspaces/[workspaceId]/overview',
              params: { workspaceId },
            }}
            className={styles.returnLink}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{t('backToWorkspace')}</span>
          </Link>
        </div>
      </header>

      {/* ==================== PAGE CONTENT ==================== */}

      <main className={styles.standaloneMain}>
        <div className={styles.standaloneIntro}>
          <h1>{t('title')}</h1>
          <p>{t('description')}</p>
        </div>
        <PersonalSettingsView layout="standalone" />
      </main>
    </div>
  );
}
