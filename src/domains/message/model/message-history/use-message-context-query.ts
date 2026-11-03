'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { retryQuery } from '@/shared/query/retry-query';

import { messageApi } from '../../api/message-api';
import type { Message, MessageContext } from './message-types';

// ==================== TYPES ====================

type Direction = 'initial' | 'older' | 'newer';
type PageParam = { direction: Direction; cursor?: string };
type ContextPage = Omit<MessageContext, 'targetMessageId'>;

// ==================== QUERY KEY AND ORDERING ====================

export const messageContextKey = (
  workspaceId: string,
  channelId: string,
  messageId: string,
  requestSequence: number
) =>
  [
    'messages',
    workspaceId,
    channelId,
    'context',
    messageId,
    requestSequence,
  ] as const;

function flattenContext(pages: ContextPage[]): Message[] {
  const seen = new Set<string>();
  const messages: Message[] = [];

  for (let index = pages.length - 1; index >= 0; index--) {
    for (const message of pages[index].items) {
      if (seen.has(message.id)) {
        continue;
      }

      seen.add(message.id);
      messages.push(message);
    }
  }

  return messages;
}

// ==================== MESSAGE CONTEXT ====================

export function useMessageContextQuery(
  workspaceId: string,
  channelId: string,
  messageId: string | undefined,
  requestSequence: number | undefined
) {
  return useInfiniteQuery({
    queryKey: messageContextKey(
      workspaceId,
      channelId,
      messageId ?? '',
      requestSequence ?? 0
    ),
    initialPageParam: { direction: 'initial' } as PageParam,
    queryFn: async ({ pageParam, signal }): Promise<ContextPage> => {
      if (!messageId) {
        throw new Error('A target message is required.');
      }

      if (pageParam.direction === 'initial') {
        const response = await messageApi.context(
          workspaceId,
          channelId,
          messageId,
          signal
        );

        if (response.targetMessageId !== messageId) {
          throw new Error('Message context returned a different target.');
        }

        return response;
      }

      const isOlder = pageParam.direction === 'older';
      const history = await messageApi.list(
        workspaceId,
        channelId,
        isOlder
          ? { before: pageParam.cursor, limit: 50 }
          : { after: pageParam.cursor, limit: 50 },
        signal
      );

      return {
        items: history.items,
        olderCursor: isOlder ? history.nextCursor : null,
        newerCursor: isOlder ? null : history.nextCursor,
      };
    },
    getNextPageParam: lastPage =>
      lastPage.olderCursor
        ? { direction: 'older' as const, cursor: lastPage.olderCursor }
        : undefined,
    getPreviousPageParam: firstPage =>
      firstPage.newerCursor
        ? { direction: 'newer' as const, cursor: firstPage.newerCursor }
        : undefined,
    select: data => ({
      ...data,
      messages: flattenContext(data.pages),
    }),
    enabled: Boolean(messageId && requestSequence && workspaceId && channelId),
    retry: retryQuery,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
