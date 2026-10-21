import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Authentication recovery already retries a protected request once.
        retry: (failureCount, error) =>
          !(isAxiosError(error) && error.response?.status === 401) &&
          failureCount < 3,
      },
    },
  });
}
