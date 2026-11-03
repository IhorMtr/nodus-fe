import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { LandingView } from '@/views/landing-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('product.metadata');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

export default function Page() {
  return <LandingView />;
}
