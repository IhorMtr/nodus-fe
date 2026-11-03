'use client';

import { isAxiosError } from 'axios';
import { useEffect } from 'react';

import { useChannelQuery } from '@/domains/channel/model/channel';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import type { ApiErrorResponse } from '@/shared/api/api-types';
import { getHttpStatus } from '@/shared/api/http-error';
import { useRouter } from '@/shared/i18n/navigation';

// ==================== PAGE STATE ====================

export function useChannelView(workspaceId: string, channelId: string) {
  // ==================== QUERIES ====================

  const router = useRouter();
  const user = useCurrentUserQuery();
  const channel = useChannelQuery(workspaceId, channelId, {
    enabled: user.isSuccess && user.isFetchedAfterMount && !user.isFetching,
  });

  // ==================== DERIVED STATE ====================

  const rawError = user.error ?? channel.error;
  const rawStatus = getHttpStatus(rawError);
  const response = isAxiosError<ApiErrorResponse>(channel.error)
    ? channel.error.response
    : undefined;

  const isTerminalError =
    rawStatus !== undefined && [400, 401, 403, 404].includes(rawStatus);
  const isReady =
    user.data !== undefined &&
    user.isFetchedAfterMount &&
    channel.data !== undefined &&
    channel.isFetchedAfterMount &&
    (!rawError || !isTerminalError);
  const error = isReady ? undefined : rawError;
  const status = isReady ? undefined : rawStatus;
  const isFetching = !isReady && (user.isFetching || channel.isFetching);
  const isUnavailable = !user.isError && response?.status === 404;
  const isInvalidLink = !user.isError && response?.status === 400;

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (!isReady || !user.data || !channel.data) {
      return;
    }

    workspaceNavigation.setLastWorkspaceId(user.data.id, workspaceId);
    workspaceNavigation.setLastChannelId(
      user.data.id,
      workspaceId,
      channel.data.id
    );
  }, [isReady, user.data, channel.data, workspaceId]);

  return {
    channel: isReady ? channel.data : undefined,
    error,
    status,
    isFetching,
    isUnavailable,
    isInvalidLink,
    isWorkspaceUnavailable:
      isUnavailable && response?.data?.messageType === 'WorkspaceNotFound',
    retry: () => {
      if (user.isError) {
        void user.refetch();
      } else {
        void channel.refetch();
      }
    },
    openApp: () => router.replace('/app'),
    openWorkspace: () =>
      router.replace({
        pathname: '/workspaces/[workspaceId]',
        params: { workspaceId },
      }),
  };
}
