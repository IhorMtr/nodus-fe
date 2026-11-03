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

let pendingReopenPath: string | null = null;

const ModalLocaleSwitchContext = createContext<ModalLocaleSwitch | null>(null);

export function useModalLocaleSwitch() {
  return useContext(ModalLocaleSwitchContext);
}

// ==================== HELPERS ====================

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

    router.push({
      pathname: '/workspaces/[workspaceId]/personal-settings',
      params: { workspaceId },
    });
  }, [pathname, router, workspaceId]);

  // ==================== HANDLERS ====================

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
