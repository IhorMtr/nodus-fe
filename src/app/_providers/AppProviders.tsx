'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { ReactNode } from 'react';

import { cssVariablesResolver, theme } from '@/shared/theme/theme';

import { FaviconSync } from './FaviconSync';
import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="auto"
    >
      <FaviconSync />
      <QueryProvider>
        <Notifications />
        {children}
      </QueryProvider>
    </MantineProvider>
  );
}
