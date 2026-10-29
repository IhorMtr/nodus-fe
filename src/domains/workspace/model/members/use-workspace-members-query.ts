'use client';

import { useQuery } from '@tanstack/react-query';

import { retryQuery } from '@/shared/query/retry-query';

import { workspaceMembersApi } from '../../api/workspace-members-api';

export function useWorkspaceMembersQuery(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', 'members', workspaceId],
    queryFn: ({ signal }) => workspaceMembersApi.list(workspaceId, signal),
    enabled: Boolean(workspaceId),
    networkMode: 'always',
    staleTime: 0,
    retry: retryQuery,
  });
}
