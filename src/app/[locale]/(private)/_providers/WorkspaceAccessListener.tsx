'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

import { authSessionEvents } from '@/domains/auth/model/session';
import type { User } from '@/domains/user/model/current-user';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import {
  workspaceQueryKeys,
  type Workspace,
} from '@/domains/workspace/model/workspace';
import { usePathname, useRouter } from '@/shared/i18n/navigation';
import { useAppSocket } from '@/shared/realtime/socket-context';

export function WorkspaceAccessListener({ children }: { children: ReactNode }) {
  const socket = useAppSocket();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();

  // ==================== ACCESS REVOCATION ====================

  useEffect(() => {
    const version = authSessionEvents.getVersion();

    const onRevoked = ({ workspaceId }: { workspaceId: string }) => {
      if (version !== authSessionEvents.getVersion()) {
        return;
      }

      const user = queryClient.getQueryData<User>(['users', 'me']);

      if (user) {
        workspaceNavigation.clearLastWorkspaceId(user.id, workspaceId);
      }

      // ==================== CACHE INVALIDATION ====================

      const revoked = (value: unknown) =>
        typeof value === 'string' &&
        value.toLowerCase() === workspaceId.toLowerCase();

      const scoped = (query: { queryKey: readonly unknown[] }) => {
        const key = query.queryKey;
        const isMessageOrChannel =
          key[0] === 'messages' || key[0] === 'channels';
        const isWorkspaceDetail =
          key[0] === 'workspaces' && key[1] === 'detail';
        const isWorkspaceMembers =
          key[0] === 'workspaces' && key[1] === 'members';
        const isWorkspaceInvites = key[0] === 'invites';

        return (
          (isMessageOrChannel && revoked(key[1])) ||
          ((isWorkspaceDetail || isWorkspaceMembers) && revoked(key[2])) ||
          (isWorkspaceInvites && revoked(key[1]))
        );
      };

      void queryClient.cancelQueries({ predicate: scoped });
      queryClient.removeQueries({ predicate: scoped });

      queryClient.setQueryData<Workspace[]>(workspaceQueryKeys.list, old =>
        old?.filter(workspace => !revoked(workspace.id))
      );

      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list });

      // ==================== NAVIGATION ====================

      if (pathname.split('/')[2]?.toLowerCase() === workspaceId.toLowerCase()) {
        router.replace('/app');
      }
    };

    // ==================== SUBSCRIPTION ====================

    socket?.on('workspace:access-revoked', onRevoked);

    return () => {
      socket?.off('workspace:access-revoked', onRevoked);
    };
  }, [socket, queryClient, pathname, router]);

  return children;
}
