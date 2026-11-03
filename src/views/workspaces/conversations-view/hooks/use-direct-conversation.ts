'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  applyDirectMessage,
  applyDirectRead,
  conversationKeys,
  useDirectHistoryQuery,
  type Conversation,
  type DirectMessage,
} from '@/domains/conversation/model/conversations';
import { useDirectMessageActions } from './use-direct-message-actions';
import { useDirectReadState } from './use-direct-read-state';
import { useDirectRealtime } from './use-direct-realtime';

// ==================== CONVERSATION ORCHESTRATION ====================

export function useDirectConversation(
  workspaceId: string,
  conversation: Conversation,
  currentUserId: string
) {
  const client = useQueryClient();
  const realtime = useDirectRealtime(workspaceId, conversation.id);
  const history = useDirectHistoryQuery(
    workspaceId,
    conversation.id,
    realtime.canLoadHistory
  );
  const actions = useDirectMessageActions(workspaceId, conversation.id);
  const messages = history.data ?? [];
  const read = useDirectReadState(
    workspaceId,
    conversation.id,
    messages,
    realtime.canLoadHistory &&
      Boolean(history.data) &&
      !history.isFetching &&
      !history.isError,
    conversation.hasUnread,
    conversation.lastMessage
  );
  const lastHistoryUpdate = useRef(0);
  const lastJoinEpoch = useRef(0);

  // ==================== HISTORY RECONCILIATION ====================

  useEffect(() => {
    if (
      history.isFetching ||
      !history.dataUpdatedAt ||
      history.dataUpdatedAt === lastHistoryUpdate.current
    ) {
      return;
    }
    lastHistoryUpdate.current = history.dataUpdatedAt;
    for (const event of realtime.pending.current.splice(0)) {
      applyDirectMessage(
        client,
        workspaceId,
        conversation.id,
        event.kind,
        event.kind === 'deleted' ? event.messageId : event.message
      );
    }

    for (const event of realtime.pendingReads.current.splice(0)) {
      applyDirectRead(
        client,
        workspaceId,
        conversation.id,
        event.readerId,
        event.lastReadCreatedAt,
        event.lastReadMessageId
      );
    }
  }, [
    history.isFetching,
    history.dataUpdatedAt,
    realtime.pending,
    realtime.pendingReads,
    client,
    workspaceId,
    conversation.id,
  ]);

  useEffect(() => {
    if (!realtime.joinEpoch || realtime.joinEpoch === lastJoinEpoch.current) {
      return;
    }
    lastJoinEpoch.current = realtime.joinEpoch;
    if (realtime.joinEpoch > 1) {
      void history.refetch();
      void client.invalidateQueries({
        queryKey: conversationKeys.list(workspaceId),
      });
    }
  }, [realtime.joinEpoch, history, client, workspaceId]);

  // ==================== VIEW CONTRACT ====================

  return {
    messages,
    realtime,
    history,
    canEdit: (message: DirectMessage) => message.author.id === currentUserId,
    canDelete: (message: DirectMessage) => message.author.id === currentUserId,
    loadOlder: () => {
      if (history.hasNextPage && !history.isFetching) {
        void history.fetchNextPage();
      }
    },
    retryOlder: () => {
      if (history.hasNextPage) {
        void history.fetchNextPage();
      }
    },
    onBottomChange: read.onBottomChange,
    lastSentId: actions.lastSentId,
    composer: actions.composer,
    editing: actions.editing,
    deletion: actions.deletion,
  };
}
