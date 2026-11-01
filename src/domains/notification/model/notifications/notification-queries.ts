'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { retryQuery } from '@/shared/query/retry-query';

import { notificationApi } from '../../api/notification-api';

// ==================== QUERY KEYS ====================

const PAGE_SIZE = 20;

export const notificationKeys = {
  list: (userId: string) => ['notifications', userId, 'list'] as const,
  count: (userId: string) => ['notifications', userId, 'count'] as const,
};

// ==================== QUERIES ====================

export function useNotificationsQuery(userId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: ({ pageParam, signal }) =>
      notificationApi.list(pageParam, PAGE_SIZE, signal),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page * lastPage.limit < lastPage.total
        ? lastPage.page + 1
        : undefined,
    enabled: enabled && Boolean(userId),
    networkMode: 'always',
    staleTime: 0,
    refetchOnMount: 'always',
    retry: retryQuery,
  });
}

export function useUnreadNotificationsCountQuery(userId: string) {
  return useQuery({
    queryKey: notificationKeys.count(userId),
    queryFn: ({ signal }) => notificationApi.unreadCount(signal),
    enabled: Boolean(userId),
    networkMode: 'always',
    retry: retryQuery,
  });
}
