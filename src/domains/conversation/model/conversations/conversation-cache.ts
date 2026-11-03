import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import type {
  Conversation,
  DirectHistory,
  DirectMessage,
} from './conversation-types';

// ==================== QUERY KEYS ====================

export const conversationKeys = {
  all: (workspaceId: string) => ['conversations', workspaceId] as const,
  list: (workspaceId: string) =>
    ['conversations', workspaceId, 'list'] as const,
  history: (workspaceId: string, conversationId: string) =>
    ['conversations', workspaceId, conversationId, 'history'] as const,
};

// ==================== TYPES ====================

type HistoryData = InfiniteData<DirectHistory, string | undefined>;

// ==================== READ BOUNDARY ====================

function atOrBefore(message: DirectMessage, createdAt: string, id: string) {
  const messageTime = Date.parse(message.createdAt);
  const boundaryTime = Date.parse(createdAt);

  if (messageTime !== boundaryTime) {
    return messageTime < boundaryTime;
  }

  return message.id.localeCompare(id) <= 0;
}

function markMessageRead(
  message: DirectMessage,
  readerId: string,
  lastReadCreatedAt: string,
  lastReadMessageId: string
): DirectMessage {
  if (message.author.id === readerId || message.read) {
    return message;
  }

  if (!atOrBefore(message, lastReadCreatedAt, lastReadMessageId)) {
    return message;
  }

  return { ...message, read: true };
}

export function applyDirectRead(
  client: QueryClient,
  workspaceId: string,
  conversationId: string,
  readerId: string,
  lastReadCreatedAt: string,
  lastReadMessageId: string
) {
  client.setQueryData<HistoryData>(
    conversationKeys.history(workspaceId, conversationId),
    data => {
      if (!data) {
        return data;
      }

      const updatedPages = data.pages.map(page => ({
        ...page,
        items: page.items.map(message =>
          markMessageRead(
            message,
            readerId,
            lastReadCreatedAt,
            lastReadMessageId
          )
        ),
      }));

      return { ...data, pages: updatedPages };
    }
  );
}

// ==================== HISTORY ====================

export function flattenDirectHistory(data: HistoryData): DirectMessage[] {
  const seen = new Set<string>();
  const messages: DirectMessage[] = [];

  for (let index = data.pages.length - 1; index >= 0; index--) {
    for (const message of data.pages[index].items) {
      if (seen.has(message.id)) {
        continue;
      }

      seen.add(message.id);
      messages.push(message);
    }
  }

  return messages;
}

function updateExistingMessage(
  existingMessage: DirectMessage,
  incomingMessage: DirectMessage
): DirectMessage {
  if (existingMessage.id !== incomingMessage.id) {
    return existingMessage;
  }

  if (existingMessage.updatedAt > incomingMessage.updatedAt) {
    return existingMessage;
  }

  if (existingMessage.read && incomingMessage.read === undefined) {
    return { ...incomingMessage, read: true };
  }

  return incomingMessage;
}

export function applyDirectMessage(
  client: QueryClient,
  workspaceId: string,
  conversationId: string,
  kind: 'created' | 'updated' | 'deleted',
  message: DirectMessage | string
) {
  client.setQueryData<HistoryData>(
    conversationKeys.history(workspaceId, conversationId),
    data => {
      if (!data) {
        return data;
      }
      const messageId = typeof message === 'string' ? message : message.id;
      const exists = data.pages.some(page =>
        page.items.some(existingMessage => existingMessage.id === messageId)
      );
      const updatedPages = data.pages.map(page => {
        if (kind === 'deleted') {
          return {
            ...page,
            items: page.items.filter(item => item.id !== messageId),
          };
        }

        if (typeof message === 'string') {
          return { ...page, items: [...page.items] };
        }

        return {
          ...page,
          items: page.items.map(existingMessage =>
            updateExistingMessage(existingMessage, message)
          ),
        };
      });

      if (
        kind === 'created' &&
        !exists &&
        typeof message !== 'string' &&
        updatedPages[0]
      ) {
        const items = [...updatedPages[0].items, message].sort(
          (first, second) =>
            Date.parse(first.createdAt) - Date.parse(second.createdAt) ||
            first.id.localeCompare(second.id)
        );
        updatedPages[0] = { ...updatedPages[0], items };
      }

      return { ...data, pages: updatedPages };
    }
  );
}

// ==================== LIST RECONCILIATION ====================

export function invalidateConversationList(
  client: QueryClient,
  workspaceId: string
) {
  void client.invalidateQueries({
    queryKey: conversationKeys.list(workspaceId),
  });
}

export function addConversationToList(
  client: QueryClient,
  workspaceId: string,
  conversation: Conversation
) {
  client.setQueryData<Conversation[]>(
    conversationKeys.list(workspaceId),
    list => {
      if (!list) {
        return [conversation];
      }

      const otherConversations = list.filter(
        item => item.id !== conversation.id
      );

      return [conversation, ...otherConversations];
    }
  );
}
