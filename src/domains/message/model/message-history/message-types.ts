export interface MessageAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Message {
  id: string;
  channelId: string;
  author: MessageAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageHistory {
  items: Message[];
  nextCursor: string | null;
}
