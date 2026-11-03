'use client';

import { Drawer } from '@mantine/core';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { User } from '@/domains/user/model/current-user';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { MemberManagementDialogs } from '@/domains/workspace/ui/member-management';
import type { Workspace } from '@/domains/workspace/model/workspace';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';
import { getHttpStatus } from '@/shared/api/http-error';
import { useRouter } from '@/shared/i18n/navigation';
import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { ChannelSearchPanel } from './components/ChannelSearchPanel';
import { ChannelSearchNavigationProvider } from './components/channel-search-navigation';
import { MembersPanel } from './components/MembersPanel';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import { useChannelUnreadRecovery } from './hooks/use-channel-unread-recovery';
import { usePresenceRealtime } from './hooks/use-presence-realtime';
import {
  MEMBERS_PANEL_ID,
  useWorkspaceShellLayout,
} from './hooks/use-workspace-shell-layout';
import styles from './WorkspaceShell.module.scss';

// ==================== SHELL LAYOUT ====================

function WorkspaceShellLayout({
  workspaceId,
  workspace,
  user,
  children,
}: {
  workspaceId: string;
  workspace: Workspace;
  user: User;
  children: ReactNode;
}) {
  // ==================== CONTEXT ====================

  const t = useTranslations('workspace');
  const layout = useWorkspaceShellLayout(workspaceId, workspace, user);
  const { activeSearchChannelId, compact } = layout;

  // ==================== RENDER ====================

  return (
    <div className={styles.shell}>
      {/* ==================== DESKTOP SIDEBAR ==================== */}

      <div className={styles.desktopSidebar}>
        <WorkspaceSidebar
          workspaceId={workspaceId}
          workspace={workspace}
          user={user}
        />
      </div>

      {/* ==================== MAIN FRAME ==================== */}

      <div className={styles.frame}>
        <WorkspaceHeader
          workspaceId={workspaceId}
          userId={user.id}
          membersPanel={layout.membersPanelControl}
          onOpenSidebar={layout.openSidebar}
          isSearchActive={layout.searchOpen}
          searchButtonRef={layout.searchButtonRef}
          onOpenSearch={layout.toggleSearch}
        />

        <div className={styles.body}>
          {/* ==================== MAIN CONTENT ==================== */}

          <main className={styles.content}>
            <ChannelSearchNavigationProvider
              value={{
                selection: layout.selection,
                selectMessage: layout.selectMessage,
              }}
            >
              {children}
            </ChannelSearchNavigationProvider>
          </main>

          {/* ==================== DESKTOP SIDE PANEL ==================== */}

          <div
            id={MEMBERS_PANEL_ID}
            className={styles.desktopMembers}
            data-open={layout.sidePanelOpen || undefined}
            data-search={layout.searchOpen || undefined}
            inert={!layout.sidePanelOpen}
          >
            <div className={styles.desktopMembersInner}>
              {activeSearchChannelId && !compact ? (
                <ChannelSearchPanel
                  key={activeSearchChannelId}
                  workspaceId={workspaceId}
                  channelId={activeSearchChannelId}
                  onClose={layout.closeSearch}
                  onSelectMessage={layout.selectMessage}
                />
              ) : (
                <MembersPanel {...layout.panelProps} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE SIDEBAR ==================== */}

      <Drawer
        opened={layout.sidebarOpened}
        onClose={layout.closeSidebar}
        withCloseButton={false}
        size="min(300px, 88vw)"
        position="left"
        classNames={{
          body: styles.sidebarDrawerBody,
          content: styles.sidebarDrawerContent,
        }}
        aria-label={t('navigation.sidebar')}
      >
        <WorkspaceSidebar
          workspaceId={workspaceId}
          workspace={workspace}
          user={user}
          onNavigate={layout.closeSidebar}
          onClose={layout.closeSidebar}
        />
      </Drawer>

      {/* ==================== MOBILE MEMBERS PANEL ==================== */}

      <Drawer
        opened={layout.drawerOpen}
        onClose={layout.closeDrawer}
        title={t('membersPanel.title')}
        size="min(264px, 88vw)"
        position="right"
        classNames={{ body: styles.drawerBody, content: styles.drawerContent }}
      >
        <MembersPanel {...layout.panelProps} withHeading={false} />
      </Drawer>

      {/* ==================== MOBILE SEARCH ==================== */}

      <Drawer
        opened={Boolean(activeSearchChannelId && compact)}
        onClose={layout.closeSearch}
        title={t('searchPanel.title')}
        size="min(340px, 90vw)"
        position="right"
        classNames={{ body: styles.drawerBody, content: styles.drawerContent }}
      >
        {activeSearchChannelId && compact && (
          <ChannelSearchPanel
            key={activeSearchChannelId}
            workspaceId={workspaceId}
            channelId={activeSearchChannelId}
            onClose={layout.closeSearch}
            onSelectMessage={layout.selectMessage}
            withHeading={false}
          />
        )}
      </Drawer>

      {/* ==================== MEMBER MANAGEMENT ==================== */}

      <MemberManagementDialogs state={layout.management} />
    </div>
  );
}

// ==================== WORKSPACE SHELL ====================

export function WorkspaceShell({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) {
  // ==================== CONTEXT AND QUERIES ====================

  const t = useTranslations('workspace');
  const auth = useTranslations('auth.messages');
  const router = useRouter();
  const user = useCurrentUserQuery();
  const workspace = useWorkspaceQuery(workspaceId, {
    enabled: user.isSuccess,
  });

  // ==================== REALTIME ====================

  usePresenceRealtime();
  useChannelUnreadRecovery(workspaceId);

  // ==================== ERROR STATE ====================

  const error = user.error ?? workspace.error;

  if (error && !user.isFetching && !workspace.isFetching) {
    const status = getHttpStatus(error);
    const unavailable = status === 400 || status === 403 || status === 404;
    let description = t('states.loadErrorDescription');

    if (status === 401) {
      description = auth('sessionExpired');
    } else if (status === 400) {
      description = t('states.invalidLink');
    } else if (status === 403) {
      description = t('states.accessDenied');
    } else if (status === 404) {
      description = t('states.unavailableDescription');
    }

    const recover = () => {
      if (unavailable) {
        router.replace('/app');
      } else if (user.isError) {
        void user.refetch();
      } else {
        void workspace.refetch();
      }
    };

    return (
      <PageFeedback
        title={unavailable ? t('states.unavailable') : t('states.loadError')}
        description={description}
        actionLabel={
          unavailable ? t('actions.openAvailable') : t('actions.retry')
        }
        onAction={recover}
      />
    );
  }

  // ==================== LOADING STATE ====================

  if (!user.data || !workspace.data) {
    return <PageSpinner label={t('states.loading')} />;
  }

  // ==================== RENDER ====================

  return (
    <WorkspaceShellLayout
      workspaceId={workspaceId}
      workspace={workspace.data}
      user={user.data}
    >
      {children}
    </WorkspaceShellLayout>
  );
}
