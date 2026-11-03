'use client';

import { createContext, useContext, type ReactNode } from 'react';

// ==================== TYPES ====================

export type SearchSelection = {
  channelId: string;
  messageId: string;
  sequence: number;
};

type SearchNavigation = {
  selection: SearchSelection | null;
  selectMessage: (messageId: string) => void;
};

// ==================== CONTEXT ====================

const ChannelSearchNavigationContext = createContext<SearchNavigation | null>(
  null
);

export function ChannelSearchNavigationProvider({
  value,
  children,
}: {
  value: SearchNavigation;
  children: ReactNode;
}) {
  return (
    <ChannelSearchNavigationContext.Provider value={value}>
      {children}
    </ChannelSearchNavigationContext.Provider>
  );
}

export function useChannelSearchNavigation() {
  const navigation = useContext(ChannelSearchNavigationContext);

  if (!navigation) {
    throw new Error('Channel search navigation requires WorkspaceShell.');
  }

  return navigation;
}
