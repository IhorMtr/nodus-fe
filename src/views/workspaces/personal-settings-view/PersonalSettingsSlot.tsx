'use client';

import {
  usePathname,
  useRouter as useDocumentRouter,
  useSelectedLayoutSegments,
} from 'next/navigation';
import { createContext, useContext, useEffect, type ReactNode } from 'react';

import { useRouter } from '@/shared/i18n/navigation';

// ==================== TYPES ====================

type SettingsLocale = 'uk' | 'en';

type ModalLocaleSwitch = (locale: SettingsLocale) => void;

// ==================== MODAL LOCALE SWITCH ====================

// Changing the [locale] segment remounts everything below it, including this
// slot. The intent to reopen the dialog therefore lives at module level and is
// consumed once by the remounted slot.
let pendingReopenPath: string | null = null;

const ModalLocaleSwitchContext = createContext<ModalLocaleSwitch | null>(null);

export function useModalLocaleSwitch() {
  return useContext(ModalLocaleSwitchContext);
}

// ==================== HELPERS ====================

// Route groups such as "(workspace)" are part of the router tree, not the URL.
function getBackgroundPath(segments: string[]) {
  return segments
    .filter(segment => !segment.startsWith('('))
    .map(segment => `/${segment}`)
    .join('');
}

// ==================== SLOT ====================

export function PersonalSettingsSlot({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) {
  // ==================== CONTEXT ====================

  // While the intercepted dialog is open, the children slot keeps rendering
  // the screen the user came from. Its segments describe that background.
  const backgroundSegments = useSelectedLayoutSegments('children');
  const pathname = usePathname();
  const documentRouter = useDocumentRouter();
  const router = useRouter();

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (pendingReopenPath === null) {
      return;
    }

    const shouldReopen = pendingReopenPath === pathname;
    pendingReopenPath = null;

    if (!shouldReopen) {
      return;
    }

    // Same-locale client navigation, so the route is intercepted again and
    // the dialog opens over the background that was just rendered.
    router.push({
      pathname: '/workspaces/[workspaceId]/personal-settings',
      params: { workspaceId },
    });
  }, [pathname, router, workspaceId]);

  // ==================== HANDLERS ====================

  // Interception cannot survive a change of the [locale] segment, so the
  // background is first rendered in the new locale and the dialog reopened.
  const switchLocale = (locale: SettingsLocale) => {
    const backgroundPath = getBackgroundPath(backgroundSegments);
    const destination = `/${locale}/workspaces/${workspaceId}${backgroundPath}`;

    pendingReopenPath = destination;
    documentRouter.replace(destination);
  };

  // ==================== RENDER ====================

  return (
    <ModalLocaleSwitchContext.Provider value={switchLocale}>
      {children}
    </ModalLocaleSwitchContext.Provider>
  );
}
