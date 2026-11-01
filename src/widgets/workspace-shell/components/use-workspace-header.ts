'use client';

import { useParams } from 'next/navigation';

import { useChannelsQuery } from '@/domains/channel/model/channel';
import { useWorkspacesQuery } from '@/domains/workspace/model/workspace';
import { usePathname, useRouter } from '@/shared/i18n/navigation';

// ==================== TYPES ====================

const workspaceSections = [
  'overview',
  'conversations',
  'announcements',
  'search',
  'members',
  'settings',
] as const;

type WorkspaceSectionRoute = (typeof workspaceSections)[number];

export type WorkspaceContext =
  | { kind: 'channel'; name: string }
  | { kind: 'section'; section: WorkspaceSectionRoute }
  | null;

// ==================== HELPERS ====================

function getSection(pathname: string): WorkspaceSectionRoute | null {
  const segment = pathname.split('/').at(-1);

  return workspaceSections.find(section => section === segment) ?? null;
}

// ==================== WORKSPACE HEADER STATE ====================

export function useWorkspaceHeader(workspaceId: string) {
  // ==================== CONTEXT ====================

  const router = useRouter();
  const pathname = usePathname();
  const { channelId } = useParams<{ channelId?: string }>();

  // ==================== QUERIES ====================

  const workspaces = useWorkspacesQuery();
  // Same cache entry as the sidebar list, so the title adds no request.
  const channels = useChannelsQuery(workspaceId);

  // ==================== DERIVED STATE ====================

  const channelName = channelId
    ? channels.data?.find(item => item.id === channelId)?.name
    : undefined;
  const section = channelId ? null : getSection(pathname);

  const context: WorkspaceContext = channelName
    ? { kind: 'channel', name: channelName }
    : section
      ? { kind: 'section', section }
      : null;

  // ==================== HANDLERS ====================

  const openSearch = () => {
    router.push({
      pathname: '/workspaces/[workspaceId]/search',
      params: { workspaceId },
    });
  };

  const retryWorkspaces = () => {
    void workspaces.refetch();
  };

  return {
    workspaces,
    context,
    isSearchActive: section === 'search',
    openSearch,
    retryWorkspaces,
  };
}
