import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import type { Message, MessageAuthor, MessageHistory } from './message-types';

// ==================== TYPES ====================

type MessageHistoryData = InfiniteData<MessageHistory, string | undefined>;

// ==================== QUERY KEY ====================

export const messageHistoryKey = (workspaceId: string, channelId: string) =>
  ['messages', workspaceId, channelId, 'history'] as const;

// ==================== DERIVED STATE ====================

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

function atOrBefore(message: Message, createdAt: string, id: string) {
  const messageTime = Date.parse(message.createdAt);
  const boundaryTime = Date.parse(createdAt);

  if (messageTime !== boundaryTime) {
    return messageTime < boundaryTime;
  }

  return message.id.localeCompare(id) <= 0;
}

function preserveReceipt(current: Message, incoming: Message): Message {
  if (!current.receipt || incoming.receipt) {
    return incoming;
  }

  return { ...incoming, receipt: current.receipt };
}

function updateHistory(
  queryClient: QueryClient,
  workspaceId: string,
  channelId: string,
  update: (data: MessageHistoryData) => MessageHistoryData
) {
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

function replaceIfNewer(current: Message, incoming: Message): Message {
  if (current.id !== incoming.id || current.updatedAt > incoming.updatedAt) {
    return current;
  }

  return preserveReceipt(current, incoming);
}

function addReaderReceipt(
  message: Message,
  reader: MessageAuthor,
  lastReadCreatedAt: string,
  lastReadMessageId: string
): Message {
  if (message.author.id === reader.id) {
    return message;
  }

  if (!atOrBefore(message, lastReadCreatedAt, lastReadMessageId)) {
    return message;
  }

  const readers = message.receipt?.readers ?? [];

  if (readers.some(person => person.id === reader.id)) {
    return message;
  }

  const nextReaders = [...readers, reader];

  return {
    ...message,
    receipt: {
      read: true,
      readerCount: nextReaders.length,
      readers: nextReaders,
    },
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
        items.map(item => replaceIfNewer(item, message))
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
    mapPages(data, items => items.map(item => replaceIfNewer(item, message)))
  );
}

export function applyChannelRead(
  queryClient: QueryClient,
  workspaceId: string,
  channelId: string,
  reader: MessageAuthor,
  lastReadCreatedAt: string,
  lastReadMessageId: string
) {
  updateHistory(queryClient, workspaceId, channelId, data =>
    mapPages(data, items =>
      items.map(item =>
        addReaderReceipt(item, reader, lastReadCreatedAt, lastReadMessageId)
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
