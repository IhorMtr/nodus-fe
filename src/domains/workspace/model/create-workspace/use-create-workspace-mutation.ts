'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';

import { workspaceApi } from '../../api/workspace-api';
import { workspaceQueryKeys } from '../workspace';

import type { CreateWorkspaceRequest } from './create-workspace-types';

export function useCreateWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: () => authSessionEvents.getVersion(),
    mutationFn: async (payload: CreateWorkspaceRequest) => {
      const version = authSessionEvents.getVersion();
      const workspace = await workspaceApi.create(payload);

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }

      return workspace;
    },
    onSuccess: (workspace, _payload, version) => {
      // A completed request from an earlier account must not repopulate its cache.
      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }

      queryClient.setQueryData(
        workspaceQueryKeys.detail(workspace.id),
        workspace
      );
      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list });
    },
    networkMode: 'always',
    retry: false,
  });
}
