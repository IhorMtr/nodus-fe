'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { retryQuery } from '@/shared/query/retry-query';
import { logRealtime } from '@/shared/realtime/realtime-debug';

import { messageApi } from '../../api/message-api';

import {
  flattenMessageHistory,
  messageHistoryKey,
} from './message-history-cache';

const PAGE_SIZE = 50;

export function useMessagesInfiniteQuery(
  workspaceId: string,
  channelId: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useInfiniteQuery({
    queryKey: messageHistoryKey(workspaceId, channelId),
    queryFn: ({ pageParam, signal }) => {
      logRealtime('[REST] MESSAGE HISTORY FETCH', {
        workspaceId,
        channelId,
        hasCursor: Boolean(pageParam),
      });

      return messageApi.list(
        workspaceId,
        channelId,
        { before: pageParam, limit: PAGE_SIZE },
        signal
      );
    },
    // The cursor is opaque and is passed back to the API unchanged.
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.nextCursor ?? undefined,
    select: flattenMessageHistory,
    enabled: enabled && Boolean(workspaceId) && Boolean(channelId),
    networkMode: 'always',
    staleTime: 0,
    refetchOnMount: 'always',
    retry: retryQuery,
  });
}
