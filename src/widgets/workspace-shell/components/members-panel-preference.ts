'use client';

import { useCallback } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ==================== TYPES ====================

interface MembersPanelPreferenceState {
  // Keyed by user id, so accounts on a shared device keep their own choice.
  openByUser: Record<string, boolean>;
  setOpen: (userId: string, open: boolean) => void;
}

// ==================== CONSTANTS ====================

const STORAGE_KEY = 'nodus:ui:members-panel';

// The panel starts open on desktop until the user closes it.
const DEFAULT_OPEN = true;

// ==================== STORE ====================

// Only the desktop UI preference is stored here; members stay in TanStack Query.
// The server snapshot is the default state, so hydration never mismatches.
const useMembersPanelPreferenceStore = create<MembersPanelPreferenceState>()(
  persist(
    set => ({
      openByUser: {},
      setOpen: (userId, open) => {
        set(state => ({
          openByUser: { ...state.openByUser, [userId]: open },
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
      partialize: state => ({ openByUser: state.openByUser }),
    }
  )
);

// ==================== PUBLIC HOOK ====================

export function useMembersPanelPreference(userId: string) {
  // ==================== DERIVED STATE ====================

  const key = userId.toLowerCase();
  const open = useMembersPanelPreferenceStore(
    state => state.openByUser[key] ?? DEFAULT_OPEN
  );
  const setOpenForUser = useMembersPanelPreferenceStore(state => state.setOpen);

  // ==================== HANDLERS ====================

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenForUser(key, next);
    },
    [setOpenForUser, key]
  );

  return { open, setOpen };
}
