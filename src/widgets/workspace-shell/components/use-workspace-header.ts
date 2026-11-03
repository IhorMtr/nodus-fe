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
  const channels = useChannelsQuery(workspaceId);

  // ==================== DERIVED STATE ====================

  const channelId = segments[0] === 'channels' ? segments[1] : undefined;
  const channelName = channelId
    ? channels.data?.find(item => item.id === channelId)?.name
    : undefined;
  const section = channelId ? null : getSection(segments[0]);

  let context: WorkspaceContext = null;

  if (channelName) {
    context = { kind: 'channel', name: channelName };
  } else if (section) {
    context = { kind: 'section', section };
  }

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
