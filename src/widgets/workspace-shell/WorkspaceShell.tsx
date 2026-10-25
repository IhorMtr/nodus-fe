'use client';

import { Drawer } from '@mantine/core';
import { isAxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';

import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';
import { useRouter } from '@/shared/i18n/navigation';
import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { WorkspaceHeader } from './components/WorkspaceHeader';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import styles from './WorkspaceShell.module.scss';

export function WorkspaceShell({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) {
  const t = useTranslations('workspace');
  const auth = useTranslations('auth.messages');
  const router = useRouter();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const user = useCurrentUserQuery();
  const workspace = useWorkspaceQuery(workspaceId, {
    enabled: user.isSuccess,
  });
  const error = user.error ?? workspace.error;
  const status = isAxiosError(error) ? error.response?.status : undefined;

  if (error && !user.isFetching && !workspace.isFetching) {
    const unavailable = status === 400 || status === 403 || status === 404;
    return (
      <PageFeedback
        title={unavailable ? t('states.unavailable') : t('states.loadError')}
        description={
          status === 401
            ? auth('sessionExpired')
            : status === 400
              ? t('states.invalidLink')
              : status === 403
                ? t('states.accessDenied')
                : unavailable
                  ? t('states.unavailableDescription')
                  : t('states.loadErrorDescription')
        }
        actionLabel={
          unavailable ? t('actions.openAvailable') : t('actions.retry')
        }
        onAction={() => {
          if (unavailable) router.replace('/app');
          else if (user.isError) void user.refetch();
          else void workspace.refetch();
        }}
      />
    );
  }

  if (!user.data || !workspace.data) {
    return <PageSpinner label={t('states.loading')} />;
  }

  return (
    <div className={styles.shell}>
      <WorkspaceHeader
        workspaceId={workspaceId}
        workspaceName={workspace.data.name}
        onOpenSidebar={() => setDrawerOpened(true)}
      />
      <div className={styles.body}>
        <div className={styles.desktopSidebar}>
          <WorkspaceSidebar workspaceId={workspaceId} user={user.data} />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title={workspace.data.name}
        size="min(320px, 88vw)"
        position="left"
        classNames={{ body: styles.drawerBody, content: styles.drawerContent }}
        aria-label={t('navigation.sidebar')}
      >
        <WorkspaceSidebar
          workspaceId={workspaceId}
          user={user.data}
          onNavigate={() => setDrawerOpened(false)}
        />
      </Drawer>
    </div>
  );
}
