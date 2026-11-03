'use client';

import type { Locale } from 'next-intl';
import { useLayoutEffect } from 'react';

export function DocumentLocale({ locale }: { locale: Locale }) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
