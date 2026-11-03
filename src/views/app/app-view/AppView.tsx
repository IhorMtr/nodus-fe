'use client';

import { useTranslations } from 'next-intl';

import { getHttpStatus } from '@/shared/api/http-error';
import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { useAppView } from './hooks/use-app-view';

// ==================== PAGE VIEW ====================

export function AppView() {
  const t = useTranslations('workspace');
  const auth = useTranslations('auth.messages');
  const { error, isFetching, retry } = useAppView();
  const status = getHttpStatus(error);

  if (error && !isFetching) {
    let description = t('states.loadErrorDescription');

    if (status === 401) {
      description = auth('sessionExpired');
    } else if (status === 403) {
      description = t('states.accessDenied');
    }

    return (
      <PageFeedback
        title={t('states.loadError')}
        description={description}
        actionLabel={t('actions.retry')}
        onAction={retry}
      />
    );
  }

  return <PageSpinner label={t('states.loading')} />;
}
