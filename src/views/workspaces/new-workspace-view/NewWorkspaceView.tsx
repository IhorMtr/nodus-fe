'use client';

import { useTranslations } from 'next-intl';

import { CreateWorkspaceForm } from '@/domains/workspace/ui/create-workspace-form';
import { Link } from '@/shared/i18n/navigation';
import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { useNewWorkspaceView } from './use-new-workspace-view';
import styles from './NewWorkspaceView.module.scss';

// ==================== PAGE VIEW ====================

export function NewWorkspaceView() {
  // ==================== VIEW STATE ====================

  const { form, previewName, isLoading, loadError, retry } =
    useNewWorkspaceView();
  const t = useTranslations('workspace');
  const product = useTranslations('product');
  const roles = useTranslations('invite.roles');

  // ==================== LOADING AND ERROR STATES ====================

  if (isLoading) {
    return <PageSpinner label={t('states.loading')} />;
  }

  if (loadError) {
    return (
      <PageFeedback
        title={loadError}
        actionLabel={t('actions.retry')}
        onAction={retry}
      />
    );
  }

  // ==================== DERIVED STATE ====================

  const monogram = previewName.charAt(0).toUpperCase();
  const previewTitle = previewName || t('fields.namePlaceholder');

  // ==================== RENDER ====================

  return (
    <div className={styles.page}>
      {/* ==================== TOP BAR ==================== */}

      <header className={styles.topBar}>
        <Link href="/app" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            N
          </span>
          {product('name')}
        </Link>
      </header>

      <main className={styles.main}>
        <section
          className={styles.panel}
          aria-labelledby="workspace-create-title"
        >
          {/* ==================== IDENTITY PREVIEW ==================== */}

          <div className={styles.preview} aria-hidden="true">
            <div
              className={styles.previewCard}
              data-empty={!previewName || undefined}
            >
              <span className={styles.monogram}>{monogram}</span>
              <span className={styles.previewText}>
                <strong>{previewTitle}</strong>
                <span>{roles('Owner')}</span>
              </span>
            </div>
          </div>

          {/* ==================== CREATION FORM ==================== */}

          <div className={styles.body}>
            <div className={styles.introduction}>
              <h1 id="workspace-create-title">{t('creation.title')}</h1>
              <p>{t('creation.description')}</p>
            </div>
            <CreateWorkspaceForm {...form} />
          </div>
        </section>
      </main>
    </div>
  );
}
