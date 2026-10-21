'use client';

import type { Locale } from 'next-intl';
import { useLayoutEffect } from 'react';

export function DocumentLocale({ locale }: { locale: Locale }) {
  useLayoutEffect(() => {
    // The shared document layout persists during client-side locale navigation.
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
