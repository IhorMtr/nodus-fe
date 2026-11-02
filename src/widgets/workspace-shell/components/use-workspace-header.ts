'use client';

import { useSelectedLayoutSegments } from 'next/navigation';

import { useChannelsQuery } from '@/domains/channel/model/channel';
import { useWorkspacesQuery } from '@/domains/workspace/model/workspace';

// ==================== TYPES ====================

const workspaceSections = [
  'overview',
  'conversations',
  'announcements',
  'search',
  'members',
  'settings',
  'personal-settings',
] as const;

type WorkspaceSectionRoute = (typeof workspaceSections)[number];

export type WorkspaceContext =
  | { kind: 'channel'; name: string }
  | { kind: 'section'; section: WorkspaceSectionRoute }
  | null;

// ==================== HELPERS ====================

function getSection(segment: string | undefined): WorkspaceSectionRoute | null {
  return workspaceSections.find(section => section === segment) ?? null;
}

// ==================== WORKSPACE HEADER STATE ====================

export function useWorkspaceHeader(workspaceId: string) {
  // ==================== CONTEXT ====================

  const segments = useSelectedLayoutSegments();

  // ==================== QUERIES ====================

  const workspaces = useWorkspacesQuery();
  // Same cache entry as the sidebar list, so the title adds no request.
  const channels = useChannelsQuery(workspaceId);

  // ==================== DERIVED STATE ====================

  // The children slot retains its background route while settings is intercepted.
  const channelId = segments[0] === 'channels' ? segments[1] : undefined;
  const channelName = channelId
    ? channels.data?.find(item => item.id === channelId)?.name
    : undefined;
  const section = channelId ? null : getSection(segments[0]);

  const context: WorkspaceContext = channelName
    ? { kind: 'channel', name: channelName }
    : section
      ? { kind: 'section', section }
      : null;

  // ==================== HANDLERS ====================

  const retryWorkspaces = () => {
    void workspaces.refetch();
  };

  return {
    workspaces,
    context,
    retryWorkspaces,
  };
}
