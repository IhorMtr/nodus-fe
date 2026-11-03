'use client';

import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { useLocale } from 'next-intl';
import { useState } from 'react';

import { useCurrentUserQuery } from '@/domains/user/model/current-user';

import { useModalLocaleSwitch } from './PersonalSettingsSlot';

// ==================== TYPES ====================

type SettingsCategory = 'account' | 'appearance';

// ==================== SETTINGS STATE ====================

export function usePersonalSettings() {
  // ==================== CONTEXT AND QUERIES ====================

  const locale = useLocale();
  const user = useCurrentUserQuery();
  const { setColorScheme } = useMantineColorScheme();
  const mounted = useMounted();
  const colorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const switchModalLocale = useModalLocaleSwitch();

  // ==================== LOCAL NAVIGATION ====================

  const [category, setCategory] = useState<SettingsCategory>('account');

  // ==================== LANGUAGE ====================

  function switchLocale(nextLocale: 'uk' | 'en') {
    if (locale === nextLocale) {
      return;
    }

    // Inside the intercepted dialog the slot keeps the workspace behind it.
    if (switchModalLocale) {
      switchModalLocale(nextLocale);
      return;
    }

    // A document load always renders the standalone page, which is exactly
    // where a direct URL or refresh should stay.
    const destination = new URL(window.location.href);
    destination.pathname = destination.pathname.replace(
      /^\/(?:uk|en)(?=\/|$)/,
      `/${nextLocale}`
    );

    window.location.replace(destination.href);
  }

  return {
    user: user.data,
    locale,
    mounted,
    colorScheme,
    setColorScheme,
    category,
    setCategory,
    switchLocale,
  };
}
