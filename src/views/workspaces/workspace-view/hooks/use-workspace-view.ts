'use client';

import { isAxiosError } from 'axios';
import { useEffect } from 'react';

import { useChannelsQuery } from '@/domains/channel/model/channel';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';
import { useRouter } from '@/shared/i18n/navigation';

export function useWorkspaceView(workspaceId: string) {
  const router = useRouter();
  const user = useCurrentUserQuery();
  const workspace = useWorkspaceQuery(workspaceId, {
    enabled: user.isSuccess && user.isFetchedAfterMount && !user.isFetching,
  });
  const channels = useChannelsQuery(workspaceId, {
    enabled:
      user.isSuccess &&
      user.isFetchedAfterMount &&
      !user.isFetching &&
      workspace.isSuccess &&
      workspace.isFetchedAfterMount &&
      !workspace.isFetching,
  });

  // ==================== ROUTE RESOLUTION ====================

  const error = user.error ?? workspace.error ?? channels.error;
  const resourceError = workspace.error ?? channels.error;
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const resourceStatus = isAxiosError(resourceError)
    ? resourceError.response?.status
    : undefined;
  const isFetching =
    user.isFetching || workspace.isFetching || channels.isFetching;
  const isReady =
    user.isSuccess &&
    user.isFetchedAfterMount &&
    workspace.isSuccess &&
    workspace.isFetchedAfterMount &&
    channels.isSuccess &&
    channels.isFetchedAfterMount;

  useEffect(() => {
    if (!isReady || isFetching) return;

    const savedId = workspaceNavigation.getLastChannelId(
      user.data.id,
      workspaceId
    );
    const channel =
      channels.data.find(item => item.id === savedId) ?? channels.data[0];
    workspaceNavigation.setLastWorkspaceId(user.data.id, workspaceId);

    if (channel) {
      router.replace({
        pathname: '/workspaces/[workspaceId]/channels/[channelId]',
        params: { workspaceId, channelId: channel.id },
      });
    }
  }, [isReady, isFetching, user.data, channels.data, workspaceId, router]);

  // ==================== RECOVERY ====================

  const retry = () => {
    if (user.isError) void user.refetch();
    else if (workspace.isError) void workspace.refetch();
    else void channels.refetch();
  };

  return {
    error,
    status,
    isFetching,
    isUnavailable: !user.isError && resourceStatus === 404,
    isInvalidLink: !user.isError && resourceStatus === 400,
    isEmpty: isReady && !isFetching && channels.data.length === 0,
    retry,
    // /app revalidates the available list before choosing another workspace.
    openApp: () => router.replace('/app'),
  };
}
