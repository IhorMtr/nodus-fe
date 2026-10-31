'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';

import { channelApi } from '../../api/channel-api';
import type { Channel } from './channel-types';
import { channelQueryKeys } from './channel-queries';

async function withCurrentSession<T>(request: () => Promise<T>): Promise<T> {
  const version = authSessionEvents.getVersion();
  const result = await request();
  if (version !== authSessionEvents.getVersion()) {
    throw new AuthError('SessionChanged');
  }
  return result;
}

export function useCreateChannelMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      withCurrentSession(() => channelApi.create(workspaceId, name)),
    onSuccess: channel => {
      queryClient.setQueryData<Channel[]>(
        channelQueryKeys.list(workspaceId),
        current => (current ? [...current, channel] : [channel])
      );
      queryClient.setQueryData(
        channelQueryKeys.detail(workspaceId, channel.id),
        channel
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
      queryClient.setQueryData<Channel[]>(
        channelQueryKeys.list(workspaceId),
        current =>
          current?.map(item => (item.id === channel.id ? channel : item))
      );
      queryClient.setQueryData(
        channelQueryKeys.detail(workspaceId, channel.id),
        channel
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
      queryClient.setQueryData<Channel[]>(
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
