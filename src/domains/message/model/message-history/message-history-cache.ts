import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import type { Message, MessageHistory } from './message-types';

// ==================== TYPES ====================

// pages[0] is the newest page; every following page holds older messages.
// Items inside each page are ordered from oldest to newest.
type MessageHistoryData = InfiniteData<MessageHistory, string | undefined>;

// ==================== QUERY KEY ====================

export const messageHistoryKey = (workspaceId: string, channelId: string) =>
  ['messages', workspaceId, channelId, 'history'] as const;

// ==================== DERIVED STATE ====================

// Walks pages from the oldest to the newest, so no sorting is required.
export function flattenMessageHistory(data: MessageHistoryData): Message[] {
  const seen = new Set<string>();
  const messages: Message[] = [];

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

// ==================== CACHE UPDATES ====================

function compareMessages(a: Message, b: Message) {
  return (
    Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
    a.id.localeCompare(b.id)
  );
}

function updateHistory(
  queryClient: QueryClient,
  workspaceId: string,
  channelId: string,
  update: (data: MessageHistoryData) => MessageHistoryData
) {
  // A channel that was never loaded has nothing to keep consistent.
  queryClient.setQueryData<MessageHistoryData>(
    messageHistoryKey(workspaceId, channelId),
    data => (data ? update(data) : data)
  );
}

function mapPages(
  data: MessageHistoryData,
  mapItems: (items: Message[]) => Message[]
): MessageHistoryData {
  return {
    ...data,
    pages: data.pages.map(page => ({ ...page, items: mapItems(page.items) })),
  };
}

export function addMessage(
  queryClient: QueryClient,
  workspaceId: string,
  channelId: string,
  message: Message
) {
  updateHistory(queryClient, workspaceId, channelId, data => {
    const exists = data.pages.some(page =>
      page.items.some(item => item.id === message.id)
    );

    if (exists) {
      return mapPages(data, items =>
        items.map(item =>
          item.id === message.id && item.updatedAt <= message.updatedAt
            ? message
            : item
        )
      );
    }

    const [newest, ...older] = data.pages;
    if (!newest) {
      return data;
    }

    const items = [...newest.items];
    let position = items.length;
    while (position > 0 && compareMessages(items[position - 1], message) > 0) {
      position--;
    }

    items.splice(position, 0, message);

    return { ...data, pages: [{ ...newest, items }, ...older] };
  });
}

export function replaceMessage(
  queryClient: QueryClient,
  workspaceId: string,
  channelId: string,
  message: Message
) {
  updateHistory(queryClient, workspaceId, channelId, data =>
    mapPages(data, items =>
      items.map(item =>
        item.id === message.id && item.updatedAt <= message.updatedAt
          ? message
          : item
      )
    )
  );
}

export function removeMessage(
  queryClient: QueryClient,
  workspaceId: string,
  channelId: string,
  messageId: string
) {
  updateHistory(queryClient, workspaceId, channelId, data =>
    mapPages(data, items => items.filter(item => item.id !== messageId))
  );
}
