import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '../model/announcements/announcement-types';

// ==================== PATHS ====================

function announcementsPath(workspaceId: string) {
  return `/workspaces/${encodeURIComponent(workspaceId)}/announcements`;
}

function announcementPath(workspaceId: string, announcementId: string) {
  return `${announcementsPath(workspaceId)}/${encodeURIComponent(announcementId)}`;
}

// ==================== TRANSPORT ====================

export const announcementApi = {
  async list(
    workspaceId: string,
    signal?: AbortSignal
  ): Promise<Announcement[]> {
    const { data } = await httpClient.get<ApiSuccessResponse<Announcement[]>>(
      announcementsPath(workspaceId),
      { signal }
    );
    return data.data;
  },

  async get(
    workspaceId: string,
    announcementId: string,
    signal?: AbortSignal
  ): Promise<Announcement> {
    const { data } = await httpClient.get<ApiSuccessResponse<Announcement>>(
      announcementPath(workspaceId, announcementId),
      { signal }
    );
    return data.data;
  },

  async create(
    workspaceId: string,
    input: CreateAnnouncementInput
  ): Promise<Announcement> {
    const { data } = await httpClient.post<ApiSuccessResponse<Announcement>>(
      announcementsPath(workspaceId),
      input
    );
    return data.data;
  },

  async update(
    workspaceId: string,
    announcementId: string,
    input: UpdateAnnouncementInput
  ): Promise<Announcement> {
    const { data } = await httpClient.patch<ApiSuccessResponse<Announcement>>(
      announcementPath(workspaceId, announcementId),
      input
    );
    return data.data;
  },

  async remove(workspaceId: string, announcementId: string): Promise<void> {
    await httpClient.delete(announcementPath(workspaceId, announcementId));
  },
};
