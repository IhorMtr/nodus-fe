'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

import { authSessionEvents } from '@/domains/auth/model/session';
import { createQueryClient } from '@/shared/query/create-query-client';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    let version = authSessionEvents.getVersion();
    return authSessionEvents.subscribe(() => {
      const currentVersion = authSessionEvents.getVersion();
      if (currentVersion === version) return;
      version = currentVersion;
      // Cancellation starts synchronously; clear before another identity can use the cache.
      void queryClient.cancelQueries();
      queryClient.clear();
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
