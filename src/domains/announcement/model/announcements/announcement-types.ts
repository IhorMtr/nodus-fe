export interface Announcement {
  id: string;
  workspaceId: string;
  authorId: string;
  title: string;
  content: string;
  publishAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  publishAt?: string;
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  publishAt?: string | null;
}
