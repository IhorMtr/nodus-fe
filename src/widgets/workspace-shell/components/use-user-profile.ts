'use client';

import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { useLocale } from 'next-intl';
import { useState } from 'react';

import { authLifecycle } from '@/domains/auth/model/session';
import { useRouter } from '@/shared/i18n/navigation';

// ==================== PROFILE ACTIONS ====================

export function useUserProfile(
  workspaceId: string,
  pathname: string,
  channelId?: string,
  onNavigate?: () => void
) {
  // ==================== CONTEXT AND STATE ====================

  const locale = useLocale();
  const router = useRouter();
  const { setColorScheme } = useMantineColorScheme();
  const mounted = useMounted();
  const colorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const isDark = mounted && colorScheme === 'dark';
  const [loggingOut, setLoggingOut] = useState(false);

  // ==================== APPEARANCE ====================

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  // ==================== LOCALE NAVIGATION ====================

  function switchLocale(nextLocale: 'uk' | 'en') {
    if (nextLocale === locale) {
      return;
    }

    onNavigate?.();
    const section = pathname.match(
      /\/(overview|conversations|announcements|search)$/
    )?.[1];

    if (channelId) {
      router.replace(
        {
          pathname: '/workspaces/[workspaceId]/channels/[channelId]',
          params: { workspaceId, channelId },
        },
        { locale: nextLocale, scroll: false }
      );
    } else if (
      section === 'overview' ||
      section === 'conversations' ||
      section === 'announcements' ||
      section === 'search'
    ) {
      router.replace(
        {
          pathname: `/workspaces/[workspaceId]/${section}`,
          params: { workspaceId },
        },
        { locale: nextLocale, scroll: false }
      );
    } else {
      router.replace(
        { pathname: '/workspaces/[workspaceId]', params: { workspaceId } },
        { locale: nextLocale, scroll: false }
      );
    }
  }

  // ==================== SESSION HANDLER ====================

  async function logout() {
    setLoggingOut(true);
    try {
      await authLifecycle.logout();
    } catch {
      // The local session is cleared even if upstream revocation fails.
    } finally {
      router.replace('/auth/login');
    }
  }

  return {
    locale,
    isDark,
    loggingOut,
    toggleColorScheme,
    switchLocale,
    logout,
  };
}
