'use client';

import { useSelectedLayoutSegments } from 'next/navigation';

import { useChannelsQuery } from '@/domains/channel/model/channel';
import { useConversationsQuery } from '@/domains/conversation/model/conversations';
import type { PresenceStatus } from '@/domains/presence/model/presence-status';
import { useWorkspaceMembersQuery } from '@/domains/workspace/model/members';
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
  | { kind: 'channel'; id: string; name: string }
  | {
      kind: 'conversation';
      name: string;
      initials: string;
      status: PresenceStatus;
    }
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

  const channelId = segments[0] === 'channels' ? segments[1] : undefined;
  const conversationId =
    segments[0] === 'conversations' ? segments[1] : undefined;

  const workspaces = useWorkspacesQuery();
  const channels = useChannelsQuery(workspaceId);
  const conversations = useConversationsQuery(
    workspaceId,
    Boolean(conversationId)
  );
  const members = useWorkspaceMembersQuery(workspaceId);

  // ==================== DERIVED STATE ====================

  const channelName = channelId
    ? channels.data?.find(item => item.id === channelId)?.name
    : undefined;
  const peer = conversationId
    ? conversations.data?.find(item => item.id === conversationId)?.otherUser
    : undefined;
  const section = channelId ? null : getSection(segments[0]);

  let context: WorkspaceContext = null;

  if (channelId && channelName) {
    context = { kind: 'channel', id: channelId, name: channelName };
  } else if (peer) {
    const member = members.data?.find(item => item.userId === peer.id);

    context = {
      kind: 'conversation',
      name: `${peer.firstName} ${peer.lastName}`.trim(),
      initials:
        `${peer.firstName.charAt(0)}${peer.lastName.charAt(0)}`.toUpperCase(),
      status: member?.status ?? peer.status,
    };
  } else if (section) {
    context = { kind: 'section', section };
  }

  return {
    workspaces,
    context,
  };
}
