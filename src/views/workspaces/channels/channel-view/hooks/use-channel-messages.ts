'use client';

import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { getMessageErrorKey } from '@/domains/message/model/message-errors';
import {
  applyMessageRealtimeEvent,
  useMessagesInfiniteQuery,
} from '@/domains/message/model/message-history';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';

import { useChannelRealtime } from './use-channel-realtime';

export function useChannelMessages(workspaceId: string, channelId: string) {
  // ==================== QUERIES AND LOCAL STATE ====================

  const errors = useTranslations('message.errors');
  const user = useCurrentUserQuery();
  const workspace = useWorkspaceQuery(workspaceId);
  const realtime = useChannelRealtime(workspaceId, channelId);
  const history = useMessagesInfiniteQuery(workspaceId, channelId, {
    enabled: realtime.canLoadHistory,
  });
  const { data, dataUpdatedAt, isFetchedAfterMount, isFetching, refetch } =
    history;
  const queryClient = useQueryClient();
  const lastHistoryUpdate = useRef(0);
  const lastJoinEpoch = useRef(0);

  // ==================== DERIVED STATE ====================

  // An unknown role never grants moderation; the backend stays authoritative.
  const canModerate =
    workspace.data?.role === 'Owner' || workspace.data?.role === 'Admin';
  const hasHistory = history.data !== undefined;
  const status = isAxiosError(history.error)
    ? history.error.response?.status
    : undefined;

  // ==================== HISTORY SYNCHRONIZATION ====================

  useEffect(() => {
    if (
      isFetching ||
      !dataUpdatedAt ||
      dataUpdatedAt === lastHistoryUpdate.current
    ) {
      return;
    }

    lastHistoryUpdate.current = dataUpdatedAt;
    const events = realtime.pendingEvents.current.splice(0);

    for (const event of events) {
      applyMessageRealtimeEvent(queryClient, workspaceId, channelId, event);
    }
  }, [
    dataUpdatedAt,
    isFetching,
    realtime.pendingEvents,
    queryClient,
    workspaceId,
    channelId,
  ]);

  useEffect(() => {
    if (!realtime.joinEpoch || realtime.joinEpoch === lastJoinEpoch.current) {
      return;
    }

    if (realtime.joinEpoch > 1 && (!data || isFetching)) {
      return;
    }

    lastJoinEpoch.current = realtime.joinEpoch;

    if (data && (realtime.joinEpoch > 1 || isFetchedAfterMount)) {
      void refetch();
    }
  }, [realtime.joinEpoch, data, isFetchedAfterMount, isFetching, refetch]);

  // ==================== HANDLERS ====================

  // fetchNextPage cancels a request that is already running, so duplicate
  // calls are filtered out here.
  const loadOlder = () => {
    if (history.hasNextPage && !history.isFetching) {
      void history.fetchNextPage();
    }
  };

  const retryOlder = () => {
    if (history.hasNextPage) {
      void history.fetchNextPage();
    }
  };

  // ==================== PUBLIC API ====================

  return {
    messages: history.data ?? [],
    joinError: realtime.joinError,
    currentUserId: user.data?.id,
    canModerate,
    isLoading: history.isPending || !user.data,
    loadError:
      history.isError && !hasHistory
        ? errors(getMessageErrorKey(history.error))
        : undefined,
    isSessionExpired: status === 401,
    hasOlder: history.hasNextPage,
    isLoadingOlder: history.isFetchingNextPage,
    hasOlderError: history.isFetchNextPageError,
    loadOlder,
    retryOlder,
    retry: () => {
      void history.refetch();
    },
  };
}
