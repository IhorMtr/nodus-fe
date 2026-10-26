'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';

import { messageApi } from '../../api/message-api';
import { isMessageNotFound } from '../message-errors';
import { removeMessage } from '../message-history/message-history-cache';

export function useDeleteMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      channelId,
      messageId,
    }: {
      workspaceId: string;
      channelId: string;
      messageId: string;
    }) => {
      const version = authSessionEvents.getVersion();
      await messageApi.delete(workspaceId, channelId, messageId);

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }
    },
    onSuccess: (_result, { workspaceId, channelId, messageId }) =>
      removeMessage(queryClient, workspaceId, channelId, messageId),
    onError: (error, { workspaceId, channelId, messageId }) => {
      // Already deleted elsewhere; the message must not stay in the list.
      if (isMessageNotFound(error)) {
        removeMessage(queryClient, workspaceId, channelId, messageId);
      }
    },
    networkMode: 'always',
    retry: false,
  });
}
