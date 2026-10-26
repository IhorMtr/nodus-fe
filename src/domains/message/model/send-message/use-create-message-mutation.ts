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

      // A completed request from an earlier account must not repopulate its cache.
      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }

      return message;
    },
    // The target comes from the variables, so a late response updates the
    // channel it was sent to, even if another channel is open by then.
    onSuccess: (message, { workspaceId, channelId }) =>
      addMessage(queryClient, workspaceId, channelId, message),
    networkMode: 'always',
    retry: false,
  });
}
