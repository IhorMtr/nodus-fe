import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type {
  Notification,
  NotificationPage,
} from '../model/notifications/notification-types';

// ==================== TRANSPORT ====================

export const notificationApi = {
  async list(
    page: number,
    limit: number,
    signal?: AbortSignal
  ): Promise<NotificationPage> {
    const { data } = await httpClient.get<ApiSuccessResponse<NotificationPage>>(
      '/notifications',
      {
        params: { page, limit },
        signal,
      }
    );
    return data.data;
  },

  async unreadCount(signal?: AbortSignal): Promise<number> {
    const { data } = await httpClient.get<
      ApiSuccessResponse<{ count: number }>
    >('/notifications/unread-count', { signal });
    return data.data.count;
  },

  async markRead(notificationId: string): Promise<Notification> {
    const { data } = await httpClient.patch<ApiSuccessResponse<Notification>>(
      `/notifications/${encodeURIComponent(notificationId)}/read`
    );
    return data.data;
  },

  async markAllRead(): Promise<number> {
    const { data } = await httpClient.post<
      ApiSuccessResponse<{ updatedCount: number }>
    >('/notifications/read-all');
    return data.data.updatedCount;
  },
};
