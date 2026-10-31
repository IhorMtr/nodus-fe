'use client';

import { useQuery } from '@tanstack/react-query';

import { retryQuery } from '@/shared/query/retry-query';

import { channelApi } from '../../api/channel-api';

export const channelQueryKeys = {
  list: (workspaceId: string) => ['channels', workspaceId, 'list'] as const,
  detail: (workspaceId: string, channelId: string) =>
    ['channels', workspaceId, 'detail', channelId] as const,
};

export function useChannelsQuery(
  workspaceId: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: channelQueryKeys.list(workspaceId),
    queryFn: ({ signal }) => channelApi.list(workspaceId, signal),
    enabled: enabled && Boolean(workspaceId),
    networkMode: 'always',
    staleTime: 0,
    refetchOnMount: 'always',
    retry: retryQuery,
  });
}

export function useChannelQuery(
  workspaceId: string,
  channelId: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: channelQueryKeys.detail(workspaceId, channelId),
    queryFn: ({ signal }) => channelApi.getById(workspaceId, channelId, signal),
    enabled: enabled && Boolean(workspaceId) && Boolean(channelId),
    networkMode: 'always',
    staleTime: 0,
    refetchOnMount: 'always',
    retry: retryQuery,
  });
}
