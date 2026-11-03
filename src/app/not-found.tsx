import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

import { NotFoundView } from '@/views/not-found-view/NotFoundView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common.notFound');

  return { title: `${t('code')} — Nodus` };
}

export default async function NotFound() {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundView />
    </NextIntlClientProvider>
  );
}
