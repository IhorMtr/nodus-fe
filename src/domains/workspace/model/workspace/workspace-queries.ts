'use client';

import { useQuery } from '@tanstack/react-query';

import { retryQuery } from '@/shared/query/retry-query';

import { workspaceApi } from '../../api/workspace-api';

// ==================== QUERY KEYS ====================

export const workspaceQueryKeys = {
  list: ['workspaces', 'list'] as const,
  detail: (workspaceId: string) =>
    ['workspaces', 'detail', workspaceId] as const,
  metrics: (workspaceId: string) =>
    ['workspaces', 'metrics', workspaceId] as const,
};

// ==================== WORKSPACE QUERIES ====================

export function useWorkspacesQuery({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: workspaceQueryKeys.list,
    queryFn: ({ signal }) => workspaceApi.list(signal),
    enabled,
    networkMode: 'always',
    staleTime: 0,
    refetchOnMount: 'always',
    retry: retryQuery,
  });
}

export function useWorkspaceQuery(
  workspaceId: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: workspaceQueryKeys.detail(workspaceId),
    queryFn: ({ signal }) => workspaceApi.getById(workspaceId, signal),
    enabled: enabled && Boolean(workspaceId),
    networkMode: 'always',
    staleTime: 0,
    refetchOnMount: 'always',
    retry: retryQuery,
  });
}

// ==================== METRICS QUERY ====================

export function useWorkspaceMetricsQuery(
  workspaceId: string,
  enabled: boolean
) {
  return useQuery({
    queryKey: workspaceQueryKeys.metrics(workspaceId),
    queryFn: ({ signal }) => workspaceApi.getMetrics(workspaceId, signal),
    enabled: enabled && Boolean(workspaceId),
    networkMode: 'always',
    staleTime: 30_000,
    retry: retryQuery,
  });
}
