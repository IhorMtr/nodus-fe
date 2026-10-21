import type { MetadataRoute } from 'next';

import { routing } from '@/shared/i18n/routing';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nodus',
    short_name: 'Nodus',
    description: 'Team communication and collaboration platform',
    start_url: `/${routing.defaultLocale}`,
    scope: '/',
    display: 'standalone',
    background_color: '#111111',
    theme_color: '#111111',
    icons: [
      {
        src: '/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
