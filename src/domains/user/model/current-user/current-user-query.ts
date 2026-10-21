'use client';

import { useQuery } from '@tanstack/react-query';

import { retryQuery } from '@/shared/query/retry-query';

import { userApi } from '../../api/user-api';

const currentUserQueryKey = ['users', 'me'] as const;

export function useCurrentUserQuery({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: ({ signal }) => userApi.getMe(signal),
    enabled,
    networkMode: 'always',
    staleTime: 0,
    refetchOnMount: 'always',
    retry: retryQuery,
  });
}
