'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import { useRef, useState } from 'react';

import type { User } from '@/domains/user/model/current-user';
import type { Workspace } from '@/domains/workspace/model/workspace';

import type { SearchSelection } from '../components/channel-search-navigation';
import { useMembersPanel } from './use-members-panel';
import { useMembersPanelLayout } from './use-members-panel-layout';
import { useStartDirectConversation } from './use-start-direct-conversation';

// ==================== CONSTANTS ====================

export const MEMBERS_PANEL_ID = 'workspace-members-panel';

// ==================== SHELL LAYOUT STATE ====================

export function useWorkspaceShellLayout(
  workspaceId: string,
  workspace: Workspace,
  user: User
) {
  // ==================== ROUTING ====================

  const segments = useSelectedLayoutSegments();
  const channelId = segments[0] === 'channels' ? segments[1] : undefined;
  const isMembersPage = segments[0] === 'members';

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

  const panelLayout = useMembersPanelLayout(user.id, isMembersPage);
  const panel = useMembersPanel(workspaceId, user.id, workspace.role);
  const direct = useStartDirectConversation(
    workspaceId,
    user.id,
    panel.groups.flatMap(group => group.members)
  );

  // ==================== DERIVED STATE ====================

  const activeSearchChannelId =
    channelId && searchChannelId === channelId ? channelId : undefined;
  const searchOpen = Boolean(activeSearchChannelId);
  const sidePanelOpen = searchOpen || panelLayout.desktopOpen;

  const membersPanelControl =
    isMembersPage || searchOpen
      ? undefined
      : {
          expanded: panelLayout.expanded,
          controls: panelLayout.compact ? undefined : MEMBERS_PANEL_ID,
          onToggle: panelLayout.toggle,
        };

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

  const toggleSearch = channelId
    ? () => {
        panelLayout.closeDrawer();
        setSearchChannelId(searchOpen ? undefined : channelId);
      }
    : undefined;

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

  return {
    sidebarOpened,
    openSidebar: () => setSidebarOpened(true),
    closeSidebar: () => setSidebarOpened(false),
    searchButtonRef,
    searchOpen,
    activeSearchChannelId,
    sidePanelOpen,
    compact: panelLayout.compact,
    drawerOpen: panelLayout.drawerOpen,
    closeDrawer: panelLayout.closeDrawer,
    membersPanelControl,
    panelProps,
    management: panel.management,
    selection,
    selectMessage,
    closeSearch,
    toggleSearch,
  };
}
