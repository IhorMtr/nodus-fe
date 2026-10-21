'use client';

import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { IconButton } from '@/shared/ui/icon-button';

export function ThemeToggle() {
  // ==================== APPEARANCE ====================

  const appearance = useTranslations('appearance');
  const mounted = useMounted();
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const isDark = mounted && colorScheme === 'dark';
  const label = appearance(
    isDark ? 'actions.switchToLight' : 'actions.switchToDark'
  );

  return (
    <IconButton
      size="sm"
      icon={isDark ? <Sun /> : <Moon />}
      aria-label={label}
      onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
    />
  );
}
