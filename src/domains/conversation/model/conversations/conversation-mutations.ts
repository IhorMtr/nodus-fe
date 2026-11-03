'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';
import { isMessageNotFound } from '@/domains/message/model/message-errors';
import { conversationApi } from '../../api/conversation-api';
import {
  addConversationToList,
  applyDirectMessage,
  conversationKeys,
  invalidateConversationList,
} from './conversation-cache';

// ==================== SESSION GUARD ====================

async function inCurrentSession<T>(request: () => Promise<T>): Promise<T> {
  const version = authSessionEvents.getVersion();
  const value = await request();
  if (version !== authSessionEvents.getVersion()) {
    throw new AuthError('SessionChanged');
  }
  return value;
}

// ==================== MUTATIONS ====================

export function useOpenConversationMutation(workspaceId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      inCurrentSession(() => conversationApi.open(workspaceId, userId)),
    onSuccess: async conversation => {
      const version = authSessionEvents.getVersion();
      await client.cancelQueries({
        queryKey: conversationKeys.list(workspaceId),
        exact: true,
      });
      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }
      addConversationToList(client, workspaceId, conversation);
      invalidateConversationList(client, workspaceId);
    },
    retry: false,
  });
}

export function useDirectMessageMutations(
  workspaceId: string,
  conversationId: string
) {
  const client = useQueryClient();
  const send = useMutation({
    mutationFn: (content: string) =>
      inCurrentSession(() =>
        conversationApi.send(workspaceId, conversationId, content)
      ),
    onSuccess: message => {
      applyDirectMessage(
        client,
        workspaceId,
        conversationId,
        'created',
        message
      );
      invalidateConversationList(client, workspaceId);
    },
    retry: false,
  });
  const update = useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) =>
      inCurrentSession(() =>
        conversationApi.update(workspaceId, conversationId, messageId, content)
      ),
    onSuccess: message => {
      applyDirectMessage(
        client,
        workspaceId,
        conversationId,
        'updated',
        message
      );
      invalidateConversationList(client, workspaceId);
    },
    onError: (error, { messageId }) => {
      if (isMessageNotFound(error)) {
        applyDirectMessage(
          client,
          workspaceId,
          conversationId,
          'deleted',
          messageId
        );
        invalidateConversationList(client, workspaceId);
      }
    },
    retry: false,
  });
  const remove = useMutation({
    mutationFn: (messageId: string) =>
      inCurrentSession(() =>
        conversationApi.remove(workspaceId, conversationId, messageId)
      ),
    onSuccess: (_value, messageId) => {
      applyDirectMessage(
        client,
        workspaceId,
        conversationId,
        'deleted',
        messageId
      );
      invalidateConversationList(client, workspaceId);
    },
    retry: false,
  });
  return { send, update, remove };
}

export function useMarkDirectReadMutation(
  workspaceId: string,
  conversationId: string
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (lastReadMessageId: string) =>
      inCurrentSession(() =>
        conversationApi.markRead(workspaceId, conversationId, lastReadMessageId)
      ),
    onSuccess: () => invalidateConversationList(client, workspaceId),
    retry: false,
  });
}
