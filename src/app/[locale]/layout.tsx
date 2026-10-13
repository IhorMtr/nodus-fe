import 'modern-normalize/modern-normalize.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@/shared/styles/globals.scss';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { appFont } from '@/shared/config/font';
import { routing } from '@/shared/i18n/routing';

import { AppProviders } from '../_providers/AppProviders';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

// ==================== CONFIGURATION ====================

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    title: 'Nodus',
    description: t('app.description'),
  };
}

// ==================== COMPONENT ====================

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} {...mantineHtmlProps} className={appFont.variable}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
