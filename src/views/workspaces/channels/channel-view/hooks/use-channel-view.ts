'use client';

import { isAxiosError } from 'axios';
import { useEffect } from 'react';

import { useChannelQuery } from '@/domains/channel/model/channel';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import type { ApiErrorResponse } from '@/shared/api/api-types';
import { useRouter } from '@/shared/i18n/navigation';

export function useChannelView(workspaceId: string, channelId: string) {
  const router = useRouter();
  const user = useCurrentUserQuery();
  const channel = useChannelQuery(workspaceId, channelId, {
    enabled: user.isSuccess && user.isFetchedAfterMount && !user.isFetching,
  });
  const rawError = user.error ?? channel.error;
  const rawStatus = isAxiosError(rawError)
    ? rawError.response?.status
    : undefined;
  const response = isAxiosError<ApiErrorResponse>(channel.error)
    ? channel.error.response
    : undefined;
  // Once the channel has loaded, a failed background refetch (for example a
  // network blip on window focus) must not replace the open conversation.
  // Only responses that mean access was lost are treated as terminal.
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

  useEffect(() => {
    if (!isReady || !user.data || !channel.data) return;

    // The scoped endpoint verifies membership and the channel's workspace.
    // An explicitly opened URL always wins over any saved channel choice.
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
      if (user.isError) void user.refetch();
      else void channel.refetch();
    },
    openApp: () => router.replace('/app'),
    openWorkspace: () =>
      router.replace({
        pathname: '/workspaces/[workspaceId]',
        params: { workspaceId },
      }),
  };
}
