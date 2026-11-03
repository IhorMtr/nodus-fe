'use client';

import { Drawer } from '@mantine/core';
import { isAxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useSelectedLayoutSegments } from 'next/navigation';
import { useRef, useState, type ReactNode } from 'react';

import type { User } from '@/domains/user/model/current-user';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { MemberManagementDialogs } from '@/domains/workspace/ui/member-management';
import type { Workspace } from '@/domains/workspace/model/workspace';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';
import { useRouter } from '@/shared/i18n/navigation';
import { PageFeedback, PageSpinner } from '@/shared/ui/page-feedback';

import { ChannelSearchPanel } from './components/ChannelSearchPanel';
import {
  ChannelSearchNavigationProvider,
  type SearchSelection,
} from './components/channel-search-navigation';
import { MembersPanel } from './components/MembersPanel';
import { useChannelUnreadRecovery } from './components/use-channel-unread-recovery';
import { useMembersPanel } from './components/use-members-panel';
import { useMembersPanelLayout } from './components/use-members-panel-layout';
import { usePresenceRealtime } from './components/use-presence-realtime';
import { useStartDirectConversation } from './components/use-start-direct-conversation';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import styles from './WorkspaceShell.module.scss';

// ==================== CONSTANTS ====================

const MEMBERS_PANEL_ID = 'workspace-members-panel';

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
  const segments = useSelectedLayoutSegments();
  const channelId = segments[0] === 'channels' ? segments[1] : undefined;

  // ==================== STATE ====================

  const [sidebarOpened, setSidebarOpened] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [searchChannelId, setSearchChannelId] = useState<string>();
  const [selection, setSelection] = useState<SearchSelection | null>(null);
  const [previousChannelId, setPreviousChannelId] = useState(channelId);

  if (previousChannelId !== channelId) {
    setPreviousChannelId(channelId);
    setSearchChannelId(undefined);
    setSelection(null);
  }

  // ==================== FEATURE HOOKS ====================

  const isMembersPage = segments[0] === 'members';
  const searchOpen = Boolean(channelId && searchChannelId === channelId);
  const panelLayout = useMembersPanelLayout(user.id, isMembersPage);
  const panel = useMembersPanel(workspaceId, user.id, workspace.role);
  const direct = useStartDirectConversation(
    workspaceId,
    user.id,
    panel.groups.flatMap(group => group.members)
  );

  // ==================== DERIVED STATE ====================

  const panelProps = {
    groups: panel.groups,
    total: panel.total,
    loading: panel.loading,
    error: panel.error,
    onRetry: panel.retry,
    canChangeRole: panel.management.canChangeRole,
    canRemove: panel.management.canRemove,
    onChangeRole: panel.management.openRole,
    onRemove: panel.management.openRemove,
    currentUserId: user.id,
    onMessage: direct.start,
    messagePending: direct.isPending,
    messageError: direct.error,
  };

  // ==================== HANDLERS ====================

  const closeSearch = () => {
    setSearchChannelId(undefined);

    if (!panelLayout.compact) {
      searchButtonRef.current?.focus();
    }
  };

  const selectMessage = (messageId: string) => {
    if (!channelId) {
      return;
    }

    setSelection(previous => ({
      channelId,
      messageId,
      sequence: (previous?.sequence ?? 0) + 1,
    }));

    if (panelLayout.compact) {
      closeSearch();
    }
  };

  // ==================== RENDER ====================

  return (
    <div className={styles.shell}>
      {/* ==================== WORKSPACE HEADER ==================== */}

      <WorkspaceHeader
        workspaceId={workspaceId}
        workspaceName={workspace.name}
        userId={user.id}
        membersPanel={
          isMembersPage || searchOpen
            ? undefined
            : {
                expanded: panelLayout.expanded,
                controls: panelLayout.compact ? undefined : MEMBERS_PANEL_ID,
                onToggle: panelLayout.toggle,
              }
        }
        onOpenSidebar={() => setSidebarOpened(true)}
        isSearchActive={searchOpen}
        searchButtonRef={searchButtonRef}
        onOpenSearch={
          channelId
            ? () => {
                panelLayout.closeDrawer();
                setSearchChannelId(searchOpen ? undefined : channelId);
              }
            : undefined
        }
      />

      <div className={styles.body}>
        {/* ==================== DESKTOP SIDEBAR ==================== */}

        <div className={styles.desktopSidebar}>
          <WorkspaceSidebar workspaceId={workspaceId} user={user} />
        </div>

        {/* ==================== MAIN CONTENT ==================== */}

        <main className={styles.content}>
          <ChannelSearchNavigationProvider value={{ selection, selectMessage }}>
            {children}
          </ChannelSearchNavigationProvider>
        </main>

        {/* ==================== DESKTOP MEMBERS PANEL ==================== */}

        <div
          id={MEMBERS_PANEL_ID}
          className={styles.desktopMembers}
          data-open={searchOpen || panelLayout.desktopOpen || undefined}
          data-search={searchOpen || undefined}
          inert={!(searchOpen || panelLayout.desktopOpen)}
        >
          <div className={styles.desktopMembersInner}>
            {searchOpen && channelId && !panelLayout.compact ? (
              <ChannelSearchPanel
                key={channelId}
                workspaceId={workspaceId}
                channelId={channelId}
                onClose={closeSearch}
                onSelectMessage={selectMessage}
              />
            ) : (
              <MembersPanel {...panelProps} />
            )}
          </div>
        </div>
      </div>

      {/* ==================== MOBILE SIDEBAR ==================== */}

      <Drawer
        opened={sidebarOpened}
        onClose={() => setSidebarOpened(false)}
        title={workspace.name}
        size="min(320px, 88vw)"
        position="left"
        classNames={{ body: styles.drawerBody, content: styles.drawerContent }}
        aria-label={t('navigation.sidebar')}
      >
        <WorkspaceSidebar
          workspaceId={workspaceId}
          user={user}
          onNavigate={() => setSidebarOpened(false)}
        />
      </Drawer>

      {/* ==================== MOBILE MEMBERS PANEL ==================== */}

      <Drawer
        opened={panelLayout.drawerOpen}
        onClose={panelLayout.closeDrawer}
        title={t('membersPanel.title')}
        size="min(300px, 88vw)"
        position="right"
        classNames={{ body: styles.drawerBody, content: styles.drawerContent }}
      >
        <MembersPanel {...panelProps} withHeading={false} />
      </Drawer>

      {/* ==================== MOBILE SEARCH ==================== */}

      <Drawer
        opened={Boolean(searchOpen && panelLayout.compact)}
        onClose={closeSearch}
        title={t('searchPanel.title')}
        size="min(360px, 90vw)"
        position="right"
        classNames={{ body: styles.drawerBody, content: styles.drawerContent }}
      >
        {searchOpen && channelId && panelLayout.compact && (
          <ChannelSearchPanel
            key={channelId}
            workspaceId={workspaceId}
            channelId={channelId}
            onClose={closeSearch}
            onSelectMessage={selectMessage}
            withHeading={false}
          />
        )}
      </Drawer>

      {/* ==================== MEMBER MANAGEMENT ==================== */}

      <MemberManagementDialogs state={panel.management} />
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

  // ==================== DERIVED FEEDBACK ====================

  const error = user.error ?? workspace.error;
  const status = isAxiosError(error) ? error.response?.status : undefined;

  // ==================== ERROR STATE ====================

  if (error && !user.isFetching && !workspace.isFetching) {
    const unavailable = status === 400 || status === 403 || status === 404;
    let description = t('states.loadErrorDescription');

    if (status === 401) {
      description = auth('sessionExpired');
    } else if (status === 400) {
      description = t('states.invalidLink');
    } else if (status === 403) {
      description = t('states.accessDenied');
    } else if (unavailable) {
      description = t('states.unavailableDescription');
    }

    return (
      <PageFeedback
        title={unavailable ? t('states.unavailable') : t('states.loadError')}
        description={description}
        actionLabel={
          unavailable ? t('actions.openAvailable') : t('actions.retry')
        }
        onAction={() => {
          if (unavailable) {
            router.replace('/app');
          } else if (user.isError) {
            void user.refetch();
          } else {
            void workspace.refetch();
          }
        }}
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
