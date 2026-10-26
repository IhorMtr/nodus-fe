'use client';

import { isAxiosError } from 'axios';
import { useTranslations } from 'next-intl';

import { getMessageErrorKey } from '@/domains/message/model/message-errors';
import { useMessagesInfiniteQuery } from '@/domains/message/model/message-history';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';

export function useChannelMessages(workspaceId: string, channelId: string) {
  const errors = useTranslations('message.errors');
  const user = useCurrentUserQuery();
  const workspace = useWorkspaceQuery(workspaceId);
  const history = useMessagesInfiniteQuery(workspaceId, channelId);

  // ==================== DERIVED STATE ====================

  // An unknown role never grants moderation; the backend stays authoritative.
  const canModerate =
    workspace.data?.role === 'Owner' || workspace.data?.role === 'Admin';
  const hasHistory = history.data !== undefined;
  const status = isAxiosError(history.error)
    ? history.error.response?.status
    : undefined;

  // ==================== HANDLERS ====================

  // fetchNextPage cancels a request that is already running, so duplicate
  // calls are filtered out here.
  const loadOlder = () => {
    if (history.hasNextPage && !history.isFetching) {
      void history.fetchNextPage();
    }
  };

  const retryOlder = () => {
    if (history.hasNextPage) void history.fetchNextPage();
  };

  return {
    messages: history.data ?? [],
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
