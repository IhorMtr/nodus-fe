import type { QueryClient } from '@tanstack/react-query';

import {
  addMessage,
  removeMessage,
  replaceMessage,
} from './message-history-cache';
import type { Message } from './message-types';

// ==================== TYPES ====================

export type MessageRealtimeEvent =
  | { kind: 'created' | 'updated'; workspaceId: string; message: Message }
  | {
      kind: 'deleted';
      workspaceId: string;
      channelId: string;
      messageId: string;
    };

// ==================== CACHE UPDATES ====================

export function applyMessageRealtimeEvent(
  queryClient: QueryClient,
  workspaceId: string,
  channelId: string,
  event: MessageRealtimeEvent
) {
  if (event.workspaceId.toLowerCase() !== workspaceId.toLowerCase()) {
    return;
  }

  if (event.kind === 'deleted') {
    if (event.channelId.toLowerCase() !== channelId.toLowerCase()) {
      return;
    }

    removeMessage(queryClient, workspaceId, channelId, event.messageId);
  } else {
    if (event.message.channelId.toLowerCase() !== channelId.toLowerCase()) {
      return;
    }

    if (event.kind === 'created') {
      addMessage(queryClient, workspaceId, channelId, event.message);
    } else {
      replaceMessage(queryClient, workspaceId, channelId, event.message);
    }
  }
}
