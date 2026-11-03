// ==================== TYPES ====================

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelWithUnread extends Channel {
  unreadCount: number;
  hasUnread: boolean;
}
