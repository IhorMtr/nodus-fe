'use client';

import { useTranslations } from 'next-intl';

import { CreateWorkspaceForm } from '@/domains/workspace/ui/create-workspace-form';
import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { useNewWorkspaceView } from './use-new-workspace-view';
import styles from './NewWorkspaceView.module.scss';

export function NewWorkspaceView() {
  const { form, isLoading, loadError, retry } = useNewWorkspaceView();
  const t = useTranslations('workspace');
  const product = useTranslations('product');

  if (isLoading) return <PageSpinner label={t('states.loading')} />;

  if (loadError) {
    return (
      <PageFeedback
        title={loadError}
        actionLabel={t('actions.retry')}
        onAction={retry}
      />
    );
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.content}
        aria-labelledby="workspace-create-title"
      >
        <p className={styles.brand}>{product('name')}</p>
        <div className={styles.introduction}>
          <h1 id="workspace-create-title">{t('creation.title')}</h1>
          <p>{t('creation.description')}</p>
        </div>
        <CreateWorkspaceForm {...form} />
      </section>
    </main>
  );
}
