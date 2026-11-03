'use client';

import { useComputedColorScheme } from '@mantine/core';
import { useMounted } from '@mantine/hooks';

export function FaviconSync() {
  const mounted = useMounted();
  const colorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: false,
  });

  if (!mounted) {
    return null;
  }

  return (
    <link
      rel="icon"
      type="image/svg+xml"
      sizes="any"
      href={`/icons/favicon-${colorScheme}.svg`}
    />
  );
}
