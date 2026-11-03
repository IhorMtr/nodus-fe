import type { QueryClient } from '@tanstack/react-query';

import type { PresenceUpdate } from '@/domains/presence/model/presence-status';

import type { WorkspaceMember } from './workspace-member-types';

// ==================== CONSTANTS ====================

const workspaceMembersRootKey = ['workspaces', 'members'] as const;

// ==================== REALTIME UPDATES ====================

export function applyWorkspaceMemberPresence(
  queryClient: QueryClient,
  update: PresenceUpdate
) {
  const userId = update.userId.toLowerCase();

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

  void queryClient.invalidateQueries({
    queryKey: workspaceMembersRootKey,
    predicate: query => query.state.fetchStatus === 'fetching',
  });
}

// ==================== RECONNECT RECOVERY ====================

export function refreshWorkspaceMembersPresence(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: workspaceMembersRootKey });
}
