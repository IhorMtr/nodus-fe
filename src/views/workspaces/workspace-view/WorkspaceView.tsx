'use client';

import { useTranslations } from 'next-intl';

import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { useWorkspaceView } from './hooks/use-workspace-view';

export function WorkspaceView({ workspaceId }: { workspaceId: string }) {
  const t = useTranslations('workspace');
  const channel = useTranslations('channel');
  const auth = useTranslations('auth.messages');
  const state = useWorkspaceView(workspaceId);

  if (state.isFetching) return <PageSpinner label={t('states.loading')} />;

  if (state.isUnavailable || state.isInvalidLink || state.status === 403) {
    return (
      <PageFeedback
        title={t('states.unavailable')}
        description={
          state.isInvalidLink
            ? t('states.invalidLink')
            : state.status === 403
              ? t('states.accessDenied')
              : t('states.unavailableDescription')
        }
        actionLabel={t('actions.openAvailable')}
        onAction={state.openApp}
      />
    );
  }

  if (state.error) {
    return (
      <PageFeedback
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
        title={channel('states.empty')}
        description={channel('states.emptyDescription')}
        actionLabel={t('actions.retry')}
        onAction={state.retry}
      />
    );
  }

  return <PageSpinner label={t('states.loading')} />;
}
