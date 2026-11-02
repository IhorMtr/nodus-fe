'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { retryQuery } from '@/shared/query/retry-query';

import { messageApi } from '../../api/message-api';

// ==================== QUERIES ====================

export function useMessageSearchQuery(
  workspaceId: string,
  channelId: string,
  query: string
) {
  return useInfiniteQuery({
    queryKey: ['messages', workspaceId, channelId, 'search', query],
    queryFn: ({ pageParam, signal }) =>
      messageApi.search(
        workspaceId,
        { q: query, channelId, cursor: pageParam },
        signal
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.nextCursor ?? undefined,
    enabled:
      Boolean(workspaceId && channelId) &&
      query.length >= 3 &&
      query.length <= 200,
    retry: retryQuery,
  });
}
