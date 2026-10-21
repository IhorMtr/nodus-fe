'use client';

import { useComputedColorScheme } from '@mantine/core';
import { useMounted } from '@mantine/hooks';

export function FaviconSync() {
  const mounted = useMounted();
  const colorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: false,
  });

  // Local storage is unavailable on the server; use the ICO until hydration.
  if (!mounted) return null;

  // React hoists this link to the head and updates the same node on theme changes.
  return (
    <link
      rel="icon"
      type="image/svg+xml"
      sizes="any"
      href={`/icons/favicon-${colorScheme}.svg`}
    />
  );
}
