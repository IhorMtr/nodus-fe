'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { notificationApi } from '../../api/notification-api';
import { notificationKeys } from './notification-queries';
import type { NotificationPage } from './notification-types';

// ==================== CACHE HELPERS ====================

function updatePages(
  current: InfiniteData<NotificationPage, number> | undefined,
  update: (
    item: NotificationPage['items'][number]
  ) => NotificationPage['items'][number]
) {
  if (!current) {
    return current;
  }

  return {
    ...current,
    pages: current.pages.map(page => ({
      ...page,
      items: page.items.map(update),
    })),
  };
}

// ==================== MUTATIONS ====================

export function useMarkNotificationReadMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: notification => {
      queryClient.setQueryData<InfiniteData<NotificationPage, number>>(
        notificationKeys.list(userId),
        current =>
          updatePages(current, item =>
            item.id === notification.id ? notification : item
          )
      );
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.count(userId),
      });
    },
  });
}

export function useMarkAllNotificationsReadMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      const readAt = new Date().toISOString();

      queryClient.setQueryData<InfiniteData<NotificationPage, number>>(
        notificationKeys.list(userId),
        current =>
          updatePages(current, item =>
            item.readAt ? item : { ...item, readAt }
          )
      );
      queryClient.setQueryData(notificationKeys.count(userId), 0);
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.list(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.count(userId),
      });
    },
  });
}
