'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { ReactNode } from 'react';

import { theme } from '@/shared/theme/theme';

import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <QueryProvider>
        <Notifications />
        {children}
      </QueryProvider>
    </MantineProvider>
  );
}
