'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';

import { workspaceApi } from '../../api/workspace-api';
import { workspaceQueryKeys } from './workspace-queries';
import type { Workspace } from './workspace-types';

// ==================== RENAME ====================

export function useRenameWorkspaceMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const version = authSessionEvents.getVersion();
      const workspace = await workspaceApi.rename(workspaceId, name);

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }

      return workspace;
    },
    onSuccess: workspace => {
      queryClient.setQueryData(
        workspaceQueryKeys.detail(workspaceId),
        workspace
      );
      queryClient.setQueryData<Workspace[]>(workspaceQueryKeys.list, old =>
        old?.map(item => (item.id === workspaceId ? workspace : item))
      );
    },
    networkMode: 'always',
    retry: false,
  });
}

// ==================== DELETION ====================

export function useDeleteWorkspaceMutation(workspaceId: string) {
  return useMutation({
    mutationFn: async () => {
      const version = authSessionEvents.getVersion();
      await workspaceApi.remove(workspaceId);

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }
    },
    networkMode: 'always',
    retry: false,
  });
}
