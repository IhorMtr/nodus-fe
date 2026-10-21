import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { routing } from '@/shared/i18n/routing';

import { DocumentLocale } from './_providers/DocumentLocale';

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
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DocumentLocale locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
