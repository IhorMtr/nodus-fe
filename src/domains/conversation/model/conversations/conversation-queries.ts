'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { retryQuery } from '@/shared/query/retry-query';
import { conversationApi } from '../../api/conversation-api';
import { conversationKeys, flattenDirectHistory } from './conversation-cache';

// ==================== QUERIES ====================

export function useConversationsQuery(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: conversationKeys.list(workspaceId),
    queryFn: ({ signal }) => conversationApi.list(workspaceId, signal),
    enabled: enabled && Boolean(workspaceId),
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnMount: 'always',
    retry: retryQuery,
  });
}

export function useDirectHistoryQuery(
  workspaceId: string,
  conversationId: string,
  enabled: boolean
) {
  return useInfiniteQuery({
    queryKey: conversationKeys.history(workspaceId, conversationId),
    queryFn: ({ pageParam, signal }) =>
      conversationApi.history(workspaceId, conversationId, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.nextCursor ?? undefined,
    select: flattenDirectHistory,
    enabled: enabled && Boolean(workspaceId) && Boolean(conversationId),
    staleTime: 0,
    refetchOnMount: 'always',
    retry: retryQuery,
  });
}
