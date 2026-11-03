'use client';

import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';

import { useMembersPanelPreference } from './members-panel-preference';

// ==================== CONSTANTS ====================

const COMPACT_QUERY = '(width < 1024px)';

// ==================== PANEL LAYOUT ====================

export function useMembersPanelLayout(userId: string, suppressed = false) {
  // ==================== STATE ====================

  const preference = useMembersPanelPreference(userId);
  const compact = useMediaQuery(COMPACT_QUERY);
  const [drawerOpened, setDrawerOpened] = useState(false);

  // ==================== DERIVED STATE ====================

  if ((!compact || suppressed) && drawerOpened) {
    setDrawerOpened(false);
  }

  const drawerOpen = !suppressed && compact && drawerOpened;
  const desktopOpen = !suppressed && preference.open;
  const expanded = compact ? drawerOpen : desktopOpen;

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
    desktopOpen,
    drawerOpen,
    expanded,
    toggle,
    closeDrawer,
  };
}
