'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';

import { messageApi } from '../../api/message-api';
import { addMessage } from '../message-history/message-history-cache';

export function useCreateMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      channelId,
      content,
    }: {
      workspaceId: string;
      channelId: string;
      content: string;
    }) => {
      const version = authSessionEvents.getVersion();
      const message = await messageApi.create(workspaceId, channelId, content);

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }

      return message;
    },
    onSuccess: (message, { workspaceId, channelId }) =>
      addMessage(queryClient, workspaceId, channelId, message),
    networkMode: 'always',
    retry: false,
  });
}
