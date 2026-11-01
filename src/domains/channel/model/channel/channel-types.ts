// ==================== TYPES ====================

// Shape returned by channel management endpoints (create and rename).
export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Shape returned by channel reads: the authenticated user's unread state.
export interface ChannelWithUnread extends Channel {
  unreadCount: number;
  hasUnread: boolean;
}
