export interface Notification {
  id: string;
  userId: string;
  workspaceId: string;
  type:
    | 'AnnouncementPublished'
    | 'DirectMessageCreated'
    | 'WorkspaceRoleChanged'
    | 'WorkspaceRemoved';
  entityId: string | null;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  items: Notification[];
  page: number;
  limit: number;
  total: number;
}
