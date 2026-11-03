'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AuthPreview } from '@/domains/auth/ui/auth-preview';
import { productVisuals } from '@/shared/assets/product-visuals';

export function AuthRoutePreview() {
  const segment = useSelectedLayoutSegment();
  const preview = useTranslations('auth.preview');
  const product = useTranslations('product');

  const lightVisual = {
    source: productVisuals.channelLight,
    alt: product('channels.visualAlt'),
  };

  if (segment === 'register') {
    return (
      <AuthPreview
        title={preview('register.title')}
        description={preview('register.description')}
        visuals={{
          dark: {
            source: productVisuals.workspaceOverview,
            alt: product('overview.visualAlt'),
          },
          light: lightVisual,
        }}
      />
    );
  }

  return (
    <AuthPreview
      title={preview('login.title')}
      description={preview('login.description')}
      visuals={{
        dark: {
          source: productVisuals.directConversation,
          alt: product('conversations.visualAlt'),
        },
        light: lightVisual,
      }}
    />
  );
}
