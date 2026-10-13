import 'modern-normalize/modern-normalize.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@/shared/styles/globals.scss';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { AppProviders } from './_providers/AppProviders';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nodus',
  description:
    'Nodus is a modern, and privacy-focused social media platform that allows users to connect, share, and engage with content in a secure and user-friendly environment.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps} className={inter.variable}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
