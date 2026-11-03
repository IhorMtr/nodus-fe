import { QueryClient } from '@tanstack/react-query';

import { getHttpStatus } from '@/shared/api/http-error';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          return getHttpStatus(error) !== 401 && failureCount < 3;
        },
      },
    },
  });
}
