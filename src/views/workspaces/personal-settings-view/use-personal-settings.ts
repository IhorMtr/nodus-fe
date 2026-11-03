'use client';

import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { useLocale } from 'next-intl';
import { useState } from 'react';

import { useCurrentUserQuery } from '@/domains/user/model/current-user';

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

  // ==================== LOCAL NAVIGATION ====================

  const [category, setCategory] = useState<SettingsCategory>('account');

  // ==================== LANGUAGE ====================

  function switchLocale(nextLocale: 'uk' | 'en') {
    if (locale === nextLocale) {
      return;
    }

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
