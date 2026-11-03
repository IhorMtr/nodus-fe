'use client';

import { isAxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type RefObject } from 'react';

import {
  applyChannelRead,
  applyMessageRealtimeEvent,
  messageContextKey,
  messageHistoryKey,
  useMessageContextQuery,
  type MessageRealtimeEvent,
} from '@/domains/message/model/message-history';
import { useChannelSearchNavigation } from '@/widgets/workspace-shell/components/channel-search-navigation';

import type { ChannelReadEvent } from './use-channel-realtime';

// ==================== TYPES ====================

type PendingContextEvents = {
  events: RefObject<MessageRealtimeEvent[]>;
  reads: RefObject<ChannelReadEvent[]>;
};

// ==================== MESSAGE CONTEXT ====================

export function useChannelMessageNavigation(
  workspaceId: string,
  channelId: string,
  joinEpoch: number,
  pending: PendingContextEvents
) {
  const t = useTranslations('message');
  const queryClient = useQueryClient();
  const { selection } = useChannelSearchNavigation();
  const [dismissedSequence, setDismissedSequence] = useState<number | null>(
    null
  );
  const lastJoinEpoch = useRef(joinEpoch);

  const selected = selection?.channelId === channelId ? selection : null;
  const requested = selected?.sequence !== dismissedSequence ? selected : null;
  const context = useMessageContextQuery(
    workspaceId,
    channelId,
    requested?.messageId,
    requested?.sequence
  );

  // ==================== RECONNECT RECONCILIATION ====================

  useEffect(() => {
    const rejoined = joinEpoch > 1 && joinEpoch !== lastJoinEpoch.current;
    lastJoinEpoch.current = joinEpoch;

    if (!rejoined || !requested) {
      return;
    }

    void queryClient.resetQueries({
      queryKey: messageContextKey(
        workspaceId,
        channelId,
        requested.messageId,
        requested.sequence
      ),
      exact: true,
    });
  }, [joinEpoch, requested, queryClient, workspaceId, channelId]);

  // ==================== REALTIME RECONCILIATION ====================

  useEffect(() => {
    if (!context.data || context.isFetching) {
      return;
    }

    for (const event of pending.events.current.splice(0)) {
      applyMessageRealtimeEvent(queryClient, workspaceId, channelId, event);
    }

    for (const read of pending.reads.current.splice(0)) {
      applyChannelRead(
        queryClient,
        workspaceId,
        channelId,
        read.reader,
        read.lastReadCreatedAt,
        read.lastReadMessageId
      );
    }
  }, [
    context.data,
    context.isFetching,
    context.dataUpdatedAt,
    pending.events,
    pending.reads,
    queryClient,
    workspaceId,
    channelId,
  ]);

  // ==================== DERIVED STATE ====================

  const messages = context.data?.messages ?? [];
  const targetAvailable = messages.some(
    message => message.id === requested?.messageId
  );
  const initialError = context.isError && !context.data;
  const isContextActive = Boolean(requested && context.data && targetAvailable);
  const isContextRequested = Boolean(requested && !initialError);

  let error: string | undefined;
  if (requested && initialError) {
    const status = isAxiosError(context.error)
      ? context.error.response?.status
      : undefined;

    if (status === 404) {
      error = t('errors.messageNotFound');
    } else if (status === 403) {
      error = t('errors.accessDenied');
    } else {
      error = t('errors.networkError');
    }
  } else if (requested && context.data && !targetAvailable) {
    error = t('errors.messageNotFound');
  }

  // ==================== HANDLERS ====================

  function jumpToLatest() {
    setDismissedSequence(requested?.sequence ?? null);
    void queryClient.resetQueries({
      queryKey: messageHistoryKey(workspaceId, channelId),
      exact: true,
    });
  }

  return {
    messages,
    isContextActive,
    isContextRequested,
    isLoadingContext: Boolean(requested && !context.data && context.isPending),
    canRetry: initialError,
    error,
    retry: () => void context.refetch(),
    jumpToLatest,
    targetRequest: requested
      ? { messageId: requested.messageId, sequence: requested.sequence }
      : undefined,
    hasOlder: context.hasNextPage,
    isLoadingOlder: context.isFetchingNextPage,
    hasOlderError: context.isFetchNextPageError,
    loadOlder: () => void context.fetchNextPage(),
    hasNewer: context.hasPreviousPage,
    isLoadingNewer: context.isFetchingPreviousPage,
    hasNewerError: context.isFetchPreviousPageError,
    loadNewer: () => void context.fetchPreviousPage(),
  };
}
