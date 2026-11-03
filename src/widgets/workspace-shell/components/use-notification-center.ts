'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { authSession } from '@/domains/auth/model/session';
import { announcementKeys } from '@/domains/announcement/model/announcements';
import {
  applyNotificationsRead,
  notificationKeys,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
  type Notification,
} from '@/domains/notification/model/notifications';
import { useRouter } from '@/shared/i18n/navigation';
import { useAppSocket } from '@/shared/realtime/socket-context';

// ==================== TYPES ====================

export type NotificationCenter = ReturnType<typeof useNotificationCenter>;

type NotificationsReadEvent = {
  userId: string;
  notificationIds: string[];
  unreadCount: number;
};

// ==================== NOTIFICATION CENTER STATE ====================

export function useNotificationCenter(
  userId: string,
  workspaceId: string,
  availableWorkspaceIds: string[]
) {
  const [panelState, setPanelState] = useState({ workspaceId, opened: false });
  const opened = panelState.workspaceId === workspaceId && panelState.opened;
  const queryClient = useQueryClient();
  const router = useRouter();
  const socket = useAppSocket();
  const sessionVersion = authSession.getVersion();

  // ==================== QUERIES AND MUTATIONS ====================

  const list = useNotificationsQuery(userId, opened);
  const count = useUnreadNotificationsCountQuery(userId);
  const markRead = useMarkNotificationReadMutation(userId);
  const markAllRead = useMarkAllNotificationsReadMutation(userId);

  // ==================== DERIVED STATE ====================

  const items = useMemo(() => {
    const unique = new Map<string, Notification>();

    for (const page of list.data?.pages ?? []) {
      for (const item of page.items) {
        unique.set(item.id, item);
      }
    }

    return [...unique.values()].sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)
    );
  }, [list.data]);
  const canMarkAll = (count.data ?? 0) > 0 || items.some(item => !item.readAt);
  const navigableIds = items
    .filter(notification => {
      if (!availableWorkspaceIds.includes(notification.workspaceId)) {
        return false;
      }

      if (notification.type === 'WorkspaceRoleChanged') {
        return true;
      }

      return (
        notification.type === 'AnnouncementPublished' &&
        Boolean(notification.entityId)
      );
    })
    .map(notification => notification.id);

  // ==================== REALTIME SYNCHRONIZATION ====================

  useEffect(() => {
    if (!socket || !userId) {
      return;
    }

    let active = true;
    let readSequence = 0;
    const pendingReadIds = new Set<string>();

    const refresh = () => {
      if (sessionVersion !== authSession.getVersion()) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: notificationKeys.list(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.count(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: announcementKeys.list(workspaceId),
      });
    };

    const onCreated = (notification: Notification) => {
      if (notification?.userId !== userId) {
        return;
      }

      refresh();

      if (
        notification.type === 'AnnouncementPublished' &&
        sessionVersion === authSession.getVersion()
      ) {
        void queryClient.invalidateQueries({
          queryKey: announcementKeys.list(notification.workspaceId),
        });
        if (notification.entityId) {
          void queryClient.invalidateQueries({
            queryKey: announcementKeys.detail(
              notification.workspaceId,
              notification.entityId
            ),
            exact: true,
          });
        }
      }
    };

    const onRead = (event: NotificationsReadEvent) => {
      if (
        event.userId !== userId ||
        sessionVersion !== authSession.getVersion()
      ) {
        return;
      }

      const sequence = ++readSequence;

      for (const notificationId of event.notificationIds) {
        pendingReadIds.add(notificationId);
      }

      void (async () => {
        await Promise.all([
          queryClient.cancelQueries({
            queryKey: notificationKeys.list(userId),
          }),
          queryClient.cancelQueries({
            queryKey: notificationKeys.count(userId),
          }),
        ]);

        if (
          !active ||
          sessionVersion !== authSession.getVersion() ||
          sequence !== readSequence
        ) {
          return;
        }

        applyNotificationsRead(
          queryClient,
          userId,
          [...pendingReadIds],
          event.unreadCount
        );
        pendingReadIds.clear();

        void queryClient.invalidateQueries({
          queryKey: notificationKeys.list(userId),
        });
        void queryClient.invalidateQueries({
          queryKey: notificationKeys.count(userId),
        });
      })();
    };

    socket.on('notification:created', onCreated);
    socket.on('notifications:read', onRead);
    socket.on('connect', refresh);

    return () => {
      active = false;
      socket.off('notification:created', onCreated);
      socket.off('notifications:read', onRead);
      socket.off('connect', refresh);
    };
  }, [socket, userId, workspaceId, sessionVersion, queryClient]);

  // ==================== HANDLERS ====================

  const open = () => {
    setPanelState({ workspaceId, opened: true });
  };

  const onMarkRead = (notificationId: string) => {
    markRead.mutate(notificationId);
  };

  const onMarkAllRead = () => {
    markAllRead.mutate();
  };

  const onSelect = (notification: Notification) => {
    if (!notification.readAt) {
      markRead.mutate(notification.id);
    }

    if (
      notification.type === 'WorkspaceRoleChanged' &&
      availableWorkspaceIds.includes(notification.workspaceId)
    ) {
      setPanelState({ workspaceId, opened: false });
      router.push({
        pathname: '/workspaces/[workspaceId]/members',
        params: { workspaceId: notification.workspaceId },
      });
    } else if (
      notification.type === 'AnnouncementPublished' &&
      notification.entityId &&
      availableWorkspaceIds.includes(notification.workspaceId)
    ) {
      setPanelState({ workspaceId, opened: false });
      router.push({
        pathname: '/workspaces/[workspaceId]/announcements',
        params: { workspaceId: notification.workspaceId },
        query: { announcement: notification.entityId },
      });
    }
  };

  return {
    opened,
    open,
    close: () => setPanelState({ workspaceId, opened: false }),
    items,
    canMarkAll,
    navigableIds,
    list,
    count,
    markRead,
    markAllRead,
    onMarkRead,
    onMarkAllRead,
    onSelect,
  };
}
