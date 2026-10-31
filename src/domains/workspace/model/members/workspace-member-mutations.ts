'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';

import { workspaceMembersApi } from '../../api/workspace-members-api';
import { workspaceQueryKeys } from '../workspace';
import { workspaceMembersKey } from './use-workspace-members-query';

// ==================== ROLE CHANGES ====================

export function useChangeWorkspaceMemberRoleMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: 'Admin' | 'Member';
    }) => {
      const version = authSessionEvents.getVersion();
      await workspaceMembersApi.changeRole(workspaceId, userId, role);

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceMembersKey(workspaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.detail(workspaceId),
      });
      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list });
    },
    networkMode: 'always',
    retry: false,
  });
}

// ==================== MEMBER REMOVAL ====================

export function useRemoveWorkspaceMemberMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const version = authSessionEvents.getVersion();
      await workspaceMembersApi.remove(workspaceId, userId);

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceMembersKey(workspaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.detail(workspaceId),
      });
      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list });
    },
    networkMode: 'always',
    retry: false,
  });
}
