export interface MessageAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ChannelReceipt {
  read: boolean;
  readerCount: number;
  readers: MessageAuthor[];
}

export interface Message {
  id: string;
  channelId: string;
  author: MessageAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
  receipt?: ChannelReceipt;
}

export interface MessageHistory {
  items: Message[];
  nextCursor: string | null;
}
