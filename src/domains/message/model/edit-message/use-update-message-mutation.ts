'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';

import { messageApi } from '../../api/message-api';
import { isMessageNotFound } from '../message-errors';
import {
  removeMessage,
  replaceMessage,
} from '../message-history/message-history-cache';

export function useUpdateMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      channelId,
      messageId,
      content,
    }: {
      workspaceId: string;
      channelId: string;
      messageId: string;
      content: string;
    }) => {
      const version = authSessionEvents.getVersion();
      const message = await messageApi.update(
        workspaceId,
        channelId,
        messageId,
        content
      );

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }

      return message;
    },
    onSuccess: (message, { workspaceId, channelId }) =>
      replaceMessage(queryClient, workspaceId, channelId, message),
    onError: (error, { workspaceId, channelId, messageId }) => {
      // The message was deleted elsewhere; stop showing it.
      if (isMessageNotFound(error)) {
        removeMessage(queryClient, workspaceId, channelId, messageId);
      }
    },
    networkMode: 'always',
    retry: false,
  });
}
