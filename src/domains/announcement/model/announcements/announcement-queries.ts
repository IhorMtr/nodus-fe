'use client';

import { useQuery } from '@tanstack/react-query';

import { retryQuery } from '@/shared/query/retry-query';

import { announcementApi } from '../../api/announcement-api';

// ==================== QUERY KEYS ====================

export const announcementKeys = {
  list: (workspaceId: string) =>
    ['workspaces', workspaceId, 'announcements'] as const,
  detail: (workspaceId: string, announcementId: string) =>
    ['workspaces', workspaceId, 'announcements', announcementId] as const,
};

// ==================== QUERIES ====================

export function useAnnouncementsQuery(workspaceId: string) {
  return useQuery({
    queryKey: announcementKeys.list(workspaceId),
    queryFn: ({ signal }) => announcementApi.list(workspaceId, signal),
    enabled: Boolean(workspaceId),
    staleTime: 0,
    refetchOnMount: 'always',
    networkMode: 'always',
    retry: retryQuery,
  });
}

export function useAnnouncementQuery(
  workspaceId: string,
  announcementId: string | null
) {
  return useQuery({
    queryKey: announcementKeys.detail(workspaceId, announcementId ?? ''),
    queryFn: ({ signal }) =>
      announcementApi.get(workspaceId, announcementId!, signal),
    enabled: Boolean(workspaceId && announcementId),
    staleTime: 0,
    networkMode: 'always',
    retry: retryQuery,
  });
}
