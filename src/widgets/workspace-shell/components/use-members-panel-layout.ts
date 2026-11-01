'use client';

import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';

import { useMembersPanelPreference } from './members-panel-preference';

// ==================== CONSTANTS ====================

// Matches the SCSS breakpoint below which the panel becomes a drawer.
const COMPACT_QUERY = '(width < 1024px)';

// ==================== PANEL LAYOUT ====================

// Desktop shows the panel inline and remembers the user's choice. Narrower
// screens use a drawer that always starts closed and is never persisted.
export function useMembersPanelLayout(userId: string) {
  // ==================== STATE ====================

  const preference = useMembersPanelPreference(userId);
  const compact = useMediaQuery(COMPACT_QUERY);
  const [drawerOpened, setDrawerOpened] = useState(false);

  // ==================== DERIVED STATE ====================

  // Leaving the compact layout closes the drawer, so it does not reappear
  // when the window is narrowed again.
  if (!compact && drawerOpened) {
    setDrawerOpened(false);
  }

  const drawerOpen = compact && drawerOpened;
  const expanded = compact ? drawerOpen : preference.open;

  // ==================== HANDLERS ====================

  const toggle = () => {
    if (compact) {
      setDrawerOpened(opened => !opened);
      return;
    }

    preference.setOpen(!preference.open);
  };

  const closeDrawer = () => {
    setDrawerOpened(false);
  };

  return {
    compact,
    desktopOpen: preference.open,
    drawerOpen,
    expanded,
    toggle,
    closeDrawer,
  };
}
