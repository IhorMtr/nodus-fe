import type { QueryClient } from '@tanstack/react-query';

import type { PresenceUpdate } from '@/domains/presence/model/presence-status';

import type { WorkspaceMember } from './workspace-member-types';

// ==================== CONSTANTS ====================

// Prefix of every cached member list, one per workspace the user has opened.
const workspaceMembersRootKey = ['workspaces', 'members'] as const;

// ==================== REALTIME UPDATES ====================

export function applyWorkspaceMemberPresence(
  queryClient: QueryClient,
  update: PresenceUpdate
) {
  const userId = update.userId.toLowerCase();

  // Only lists already cached are patched, so presence never leaks into
  // workspaces the user cannot open.
  queryClient.setQueriesData<WorkspaceMember[]>(
    { queryKey: workspaceMembersRootKey },
    members => {
      if (!members) {
        return members;
      }

      const target = members.find(
        member => member.userId.toLowerCase() === userId
      );

      if (!target || target.status === update.status) {
        return members;
      }

      return members.map(member =>
        member === target ? { ...member, status: update.status } : member
      );
    }
  );

  // A request already in flight may have read the state before this update.
  // Restart it so the stale response cannot overwrite the event.
  void queryClient.invalidateQueries({
    queryKey: workspaceMembersRootKey,
    predicate: query => query.state.fetchStatus === 'fetching',
  });
}

// ==================== RECONNECT RECOVERY ====================

export function refreshWorkspaceMembersPresence(queryClient: QueryClient) {
  // Events are not replayed, so the REST list is the source of truth after a reconnect.
  void queryClient.invalidateQueries({ queryKey: workspaceMembersRootKey });
}
