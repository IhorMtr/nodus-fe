'use client';

import { useDocumentVisibility } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  conversationKeys,
  useMarkDirectReadMutation,
  type DirectMessage,
} from '@/domains/conversation/model/conversations';

// ==================== READ STATE ====================

export function useDirectReadState(
  workspaceId: string,
  conversationId: string,
  messages: DirectMessage[],
  ready: boolean,
  hasUnread: boolean,
  lastMessage: DirectMessage | null
) {
  const client = useQueryClient();
  const visibility = useDocumentVisibility();
  const { mutate: markRead, isPending } = useMarkDirectReadMutation(
    workspaceId,
    conversationId
  );
  const [atBottom, setAtBottom] = useState(true);
  const [initialUnread] = useState(hasUnread);
  const [initialLastMessage] = useState(lastMessage);
  const boundary = useRef<DirectMessage | null>(null);
  const initialized = useRef(false);
  const failedId = useRef<string | null>(null);
  const reportedId = useRef<string | null>(null);
  const latest = messages.at(-1);

  // ==================== VISIBLE BOUNDARY ====================

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (!initialized.current) {
      initialized.current = true;
      boundary.current = initialUnread ? null : initialLastMessage;
      reportedId.current = latest?.id ?? null;
    }
    if (!latest || isPending) {
      return;
    }
    const previous = boundary.current;
    const newer =
      !previous ||
      Date.parse(latest.createdAt) > Date.parse(previous.createdAt) ||
      (latest.createdAt === previous.createdAt && latest.id > previous.id);
    if (!newer || latest.id === failedId.current) {
      return;
    }
    if (visibility === 'visible' && atBottom) {
      boundary.current = latest;
      markRead(latest.id, {
        onError: () => {
          boundary.current = previous;
          failedId.current = latest.id;
        },
      });
    } else if (reportedId.current !== latest.id) {
      reportedId.current = latest.id;
      void client.invalidateQueries({
        queryKey: conversationKeys.list(workspaceId),
      });
    }
  }, [
    ready,
    latest,
    isPending,
    initialUnread,
    initialLastMessage,
    markRead,
    visibility,
    atBottom,
    client,
    workspaceId,
  ]);

  return { onBottomChange: setAtBottom };
}
