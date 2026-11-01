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
  // Chronological order: the latest displayed message is the last one.
  messages: Message[];
  isHistoryReady: boolean;
  // Unread flag of the channel as loaded when the conversation opened.
  hasUnread: boolean;
}

// ==================== HELPERS ====================

// Mirrors the backend history order (createdAt, then id).
function isNewerMessage(message: Message, boundary: Message) {
  const difference =
    Date.parse(message.createdAt) - Date.parse(boundary.createdAt);

  return difference > 0 || (difference === 0 && message.id > boundary.id);
}

// ==================== READ STATE ====================

// Marks messages read only while the reader can actually see the latest one:
// the tab is visible and the history is scrolled to the bottom.
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

  // The newest message already sent (or being sent) as the read boundary.
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

    // An already read channel starts with its latest message as the boundary,
    // so opening it sends nothing.
    if (!initializedRef.current) {
      initializedRef.current = true;
      boundaryRef.current = hasUnread ? null : (latest ?? null);
      reportedIdRef.current = latest?.id ?? null;
    }

    // Empty channels have no state to store; one request runs at a time.
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

    // The reader sees the latest message: advance the boundary to it.
    if (isVisible && isAtBottom) {
      boundaryRef.current = latest;

      markRead(
        { channelId, lastReadMessageId: latest.id },
        {
          onError: () => {
            // Retried only for a newer message, never in a loop.
            boundaryRef.current = boundary;
            failedIdRef.current = latest.id;
          },
        }
      );
      return;
    }

    // A new message stays unread: reload the counters shown in the sidebar.
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
    // Deleted messages no longer count as unread, so the counters may change.
    // Loading older history only grows the list and is ignored.
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
