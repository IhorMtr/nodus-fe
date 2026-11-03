import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import { notificationKeys } from './notification-queries';
import type { NotificationPage } from './notification-types';

// ==================== TYPES ====================

type NotificationHistory = InfiniteData<NotificationPage, number>;

// ==================== REALTIME CACHE UPDATE ====================

export function applyNotificationsRead(
  client: QueryClient,
  userId: string,
  notificationIds: string[],
  unreadCount: number
) {
  const readIds = new Set(notificationIds);
  const readAt = new Date().toISOString();

  client.setQueryData<NotificationHistory>(
    notificationKeys.list(userId),
    data => {
      if (!data) {
        return data;
      }

      const updatedPages = data.pages.map(page => ({
        ...page,
        items: page.items.map(notification => {
          if (!readIds.has(notification.id) || notification.readAt) {
            return notification;
          }

          return { ...notification, readAt };
        }),
      }));

      return { ...data, pages: updatedPages };
    }
  );
  client.setQueryData(notificationKeys.count(userId), unreadCount);
}
