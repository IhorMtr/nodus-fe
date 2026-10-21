import 'modern-normalize/modern-normalize.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@/shared/styles/globals.scss';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { appFont } from '@/shared/config/font';

import { AppProviders } from './_providers/AppProviders';

export const metadata: Metadata = {
  applicationName: 'Nodus',
  openGraph: {
    type: 'website',
    siteName: 'Nodus',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} {...mantineHtmlProps} className={appFont.variable}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
