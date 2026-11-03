'use client';

import { isAxiosError } from 'axios';
import { useTranslations } from 'next-intl';

import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { useAppView } from './hooks/use-app-view';

export function AppView() {
  const t = useTranslations('workspace');
  const auth = useTranslations('auth.messages');
  const { error, isFetching, retry } = useAppView();
  const status = isAxiosError(error) ? error.response?.status : undefined;

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
