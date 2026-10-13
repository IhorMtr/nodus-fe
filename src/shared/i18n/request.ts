import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

// ==================== CONFIGURATION ====================

export default getRequestConfig(async ({ locale: localeOverride }) => {
  const locale = localeOverride ?? (await rootParams.locale());

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // ==================== MESSAGE LOADING ====================

  const [common, user, product, navigation, appearance, language, presence] =
    await Promise.all([
      import(`../../../messages/${locale}/common.json`),
      import(`../../../messages/${locale}/user.json`),
      import(`../../../messages/${locale}/product.json`),
      import(`../../../messages/${locale}/navigation.json`),
      import(`../../../messages/${locale}/appearance.json`),
      import(`../../../messages/${locale}/language.json`),
      import(`../../../messages/${locale}/presence.json`),
    ]);

  return {
    locale,
    messages: {
      common: common.default,
      user: user.default,
      product: product.default,
      navigation: navigation.default,
      appearance: appearance.default,
      language: language.default,
      presence: presence.default,
    },
  };
});
