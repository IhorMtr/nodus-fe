'use client';

import { useTranslations } from 'next-intl';

import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { useWorkspaceView } from './hooks/use-workspace-view';

export function WorkspaceView({ workspaceId }: { workspaceId: string }) {
  const t = useTranslations('workspace');
  const channel = useTranslations('channel');
  const auth = useTranslations('auth.messages');
  const state = useWorkspaceView(workspaceId);

  if (state.isFetching) {
    return <PageSpinner contained label={t('states.loading')} />;
  }

  if (state.isUnavailable || state.isInvalidLink || state.status === 403) {
    let description = t('states.unavailableDescription');

    if (state.isInvalidLink) {
      description = t('states.invalidLink');
    } else if (state.status === 403) {
      description = t('states.accessDenied');
    }

    return (
      <PageFeedback
        contained
        title={t('states.unavailable')}
        description={description}
        actionLabel={t('actions.openAvailable')}
        onAction={state.openApp}
      />
    );
  }

  if (state.error) {
    return (
      <PageFeedback
        contained
        title={t('states.loadError')}
        description={
          state.status === 401
            ? auth('sessionExpired')
            : t('states.loadErrorDescription')
        }
        actionLabel={t('actions.retry')}
        onAction={state.retry}
      />
    );
  }

  if (state.isEmpty) {
    return (
      <PageFeedback
        contained
        title={channel('states.empty')}
        description={channel('states.emptyDescription')}
        actionLabel={t('actions.retry')}
        onAction={state.retry}
      />
    );
  }

  return <PageSpinner contained label={t('states.loading')} />;
}
