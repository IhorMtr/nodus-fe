'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';

import { channelApi } from '../../api/channel-api';
import type { ChannelWithUnread } from './channel-types';
import { channelQueryKeys } from './channel-queries';

// ==================== HELPERS ====================

export async function withCurrentSession<T>(
  request: () => Promise<T>
): Promise<T> {
  const version = authSessionEvents.getVersion();
  const result = await request();
  if (version !== authSessionEvents.getVersion()) {
    throw new AuthError('SessionChanged');
  }
  return result;
}

// ==================== MUTATIONS ====================

export function useCreateChannelMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      withCurrentSession(() => channelApi.create(workspaceId, name)),
    onSuccess: channel => {
      // A new channel has no messages, so nothing is unread yet.
      const created: ChannelWithUnread = {
        ...channel,
        unreadCount: 0,
        hasUnread: false,
      };

      queryClient.setQueryData<ChannelWithUnread[]>(
        channelQueryKeys.list(workspaceId),
        current => (current ? [...current, created] : [created])
      );
      queryClient.setQueryData(
        channelQueryKeys.detail(workspaceId, channel.id),
        created
      );
      void queryClient.invalidateQueries({
        queryKey: channelQueryKeys.list(workspaceId),
      });
    },
    networkMode: 'always',
    retry: false,
  });
}

export function useRenameChannelMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, name }: { channelId: string; name: string }) =>
      withCurrentSession(() => channelApi.rename(workspaceId, channelId, name)),
    onSuccess: channel => {
      // Renaming keeps the cached unread state of the channel.
      queryClient.setQueryData<ChannelWithUnread[]>(
        channelQueryKeys.list(workspaceId),
        current =>
          current?.map(item =>
            item.id === channel.id ? { ...item, ...channel } : item
          )
      );
      queryClient.setQueryData<ChannelWithUnread>(
        channelQueryKeys.detail(workspaceId, channel.id),
        current => (current ? { ...current, ...channel } : current)
      );
      void queryClient.invalidateQueries({
        queryKey: channelQueryKeys.list(workspaceId),
      });
    },
    networkMode: 'always',
    retry: false,
  });
}

export function useDeleteChannelMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) =>
      withCurrentSession(() => channelApi.remove(workspaceId, channelId)),
    onSuccess: async (_result, channelId) => {
      await queryClient.cancelQueries({
        queryKey: channelQueryKeys.detail(workspaceId, channelId),
      });
      queryClient.removeQueries({
        queryKey: channelQueryKeys.detail(workspaceId, channelId),
      });
      queryClient.setQueryData<ChannelWithUnread[]>(
        channelQueryKeys.list(workspaceId),
        current => current?.filter(item => item.id !== channelId)
      );
      void queryClient.invalidateQueries({
        queryKey: channelQueryKeys.list(workspaceId),
      });
    },
    networkMode: 'always',
    retry: false,
  });
}
