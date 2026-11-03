'use client';

import { useMemo } from 'react';

import { useAnnouncementsQuery } from '@/domains/announcement/model/announcements';
import { useChannelsQuery } from '@/domains/channel/model/channel';
import {
  getWorkspaceMemberName,
  useWorkspaceMembersQuery,
} from '@/domains/workspace/model/members';
import {
  canManageWorkspace,
  useWorkspaceMetricsQuery,
  useWorkspaceQuery,
} from '@/domains/workspace/model/workspace';

// ==================== PAGE QUERIES ====================

export function useOverviewView(workspaceId: string) {
  const workspace = useWorkspaceQuery(workspaceId);
  const channels = useChannelsQuery(workspaceId);
  const announcements = useAnnouncementsQuery(workspaceId);
  const members = useWorkspaceMembersQuery(workspaceId);

  // ==================== PERMISSIONS ====================

  const canViewMetrics = canManageWorkspace(workspace.data?.role);
  const metrics = useWorkspaceMetricsQuery(
    workspaceId,
    workspace.isSuccess &&
      workspace.isFetchedAfterMount &&
      !workspace.isFetching &&
      canViewMetrics
  );

  // ==================== DERIVED STATE ====================

  const visibleChannels = useMemo(() => {
    const items = [...(channels.data ?? [])];
    items.sort((first, second) => {
      if (first.hasUnread !== second.hasUnread) {
        return first.hasUnread ? -1 : 1;
      }

      return second.unreadCount - first.unreadCount;
    });
    return items;
  }, [channels.data]);

  const recentAnnouncements = useMemo(() => {
    const published = (announcements.data ?? []).filter(
      item => item.publishedAt !== null
    );
    published.sort((first, second) =>
      (second.publishedAt ?? '').localeCompare(first.publishedAt ?? '')
    );
    return published.slice(0, 3);
  }, [announcements.data]);

  const visibleMembers = useMemo(() => {
    const items = [...(members.data ?? [])];
    items.sort((first, second) => {
      if (first.status === 'online' && second.status !== 'online') {
        return -1;
      }
      if (second.status === 'online' && first.status !== 'online') {
        return 1;
      }
      return first.firstName.localeCompare(second.firstName);
    });
    return items.slice(0, 5);
  }, [members.data]);

  const authorNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const member of members.data ?? []) {
      names.set(member.userId.toLowerCase(), getWorkspaceMemberName(member));
    }
    return names;
  }, [members.data]);

  const onlineCount = (members.data ?? []).filter(
    member => member.status === 'online'
  ).length;
  const showChannels = channels.isSuccess && visibleChannels.length > 0;
  const showAnnouncements =
    announcements.isSuccess && recentAnnouncements.length > 0;
  const showMembers = members.isSuccess && visibleMembers.length > 0;
  const visibleMetrics = canViewMetrics ? metrics.data : undefined;

  return {
    workspace,
    channels,
    announcements,
    members,
    metrics,
    canViewMetrics,
    visibleChannels,
    recentAnnouncements,
    visibleMembers,
    authorNames,
    onlineCount,
    showChannels,
    showAnnouncements,
    showMembers,
    visibleMetrics,
  };
}
