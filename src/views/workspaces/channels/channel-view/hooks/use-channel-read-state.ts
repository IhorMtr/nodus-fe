'use client';

import { useDocumentVisibility } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { channelQueryKeys } from '@/domains/channel/model/channel';
import { useMarkChannelReadMutation } from '@/domains/channel/model/read-state';
import type { Message } from '@/domains/message/model/message-history';

// ==================== TYPES ====================

interface ChannelReadStateOptions {
  workspaceId: string;
  channelId: string;
  messages: Message[];
  isHistoryReady: boolean;
  hasUnread: boolean;
}

// ==================== HELPERS ====================

function isNewerMessage(message: Message, boundary: Message) {
  const difference =
    Date.parse(message.createdAt) - Date.parse(boundary.createdAt);

  return difference > 0 || (difference === 0 && message.id > boundary.id);
}

// ==================== READ STATE ====================

export function useChannelReadState({
  workspaceId,
  channelId,
  messages,
  isHistoryReady,
  hasUnread,
}: ChannelReadStateOptions) {
  // ==================== CONTEXT AND MUTATIONS ====================

  const queryClient = useQueryClient();
  const visibility = useDocumentVisibility();
  const { mutate: markRead, isPending } =
    useMarkChannelReadMutation(workspaceId);

  // ==================== STATE AND REFS ====================

  const [isAtBottom, setIsAtBottom] = useState(true);

  const boundaryRef = useRef<Message | null>(null);
  const initializedRef = useRef(false);
  const failedIdRef = useRef<string | null>(null);
  const reportedIdRef = useRef<string | null>(null);
  const messageCountRef = useRef(0);

  // ==================== DERIVED STATE ====================

  const latest = messages.at(-1);
  const isVisible = visibility === 'visible';
  const messageCount = messages.length;

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (!isHistoryReady) {
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      boundaryRef.current = hasUnread ? null : (latest ?? null);
      reportedIdRef.current = latest?.id ?? null;
    }

    if (!latest || isPending) {
      return;
    }

    const boundary = boundaryRef.current;

    if (boundary && !isNewerMessage(latest, boundary)) {
      return;
    }

    if (latest.id === failedIdRef.current) {
      return;
    }

    if (isVisible && isAtBottom) {
      boundaryRef.current = latest;

      markRead(
        { channelId, lastReadMessageId: latest.id },
        {
          onError: () => {
            boundaryRef.current = boundary;
            failedIdRef.current = latest.id;
          },
        }
      );
      return;
    }

    if (reportedIdRef.current !== latest.id) {
      reportedIdRef.current = latest.id;

      void queryClient.invalidateQueries({
        queryKey: channelQueryKeys.list(workspaceId),
      });
    }
  }, [
    isHistoryReady,
    hasUnread,
    latest,
    isPending,
    isVisible,
    isAtBottom,
    markRead,
    channelId,
    workspaceId,
    queryClient,
  ]);

  useEffect(() => {
    if (isHistoryReady && messageCount < messageCountRef.current) {
      void queryClient.invalidateQueries({
        queryKey: channelQueryKeys.list(workspaceId),
      });
    }

    messageCountRef.current = messageCount;
  }, [isHistoryReady, messageCount, queryClient, workspaceId]);

  // ==================== PUBLIC API ====================

  return {
    onBottomChange: setIsAtBottom,
  };
}
