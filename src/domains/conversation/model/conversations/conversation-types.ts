import type { MessageAuthor } from '@/domains/message/model/message-history';
import type { PresenceStatus } from '@/domains/presence/model/presence-status';

export interface DirectMessage {
  id: string;
  conversationId: string;
  author: MessageAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
  read?: boolean;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    status: PresenceStatus;
  };
  createdAt: string;
  updatedAt: string;
  lastMessage: DirectMessage | null;
  unreadCount: number;
  hasUnread: boolean;
}

export interface DirectHistory {
  items: DirectMessage[];
  nextCursor: string | null;
}

export interface DirectReadState {
  lastReadMessageId: string;
  lastReadAt: string;
}
