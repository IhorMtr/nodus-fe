import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          const isUnauthorized =
            isAxiosError(error) && error.response?.status === 401;

          return !isUnauthorized && failureCount < 3;
        },
      },
    },
  });
}
