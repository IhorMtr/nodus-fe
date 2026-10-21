import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

// ==================== CONFIGURATION ====================

export default getRequestConfig(
  async ({ locale: localeOverride, requestLocale }) => {
    // The locale segment is below the stable document layout, so use the proxy locale.
    const requestedLocale = localeOverride ?? (await requestLocale);
    const locale = hasLocale(routing.locales, requestedLocale)
      ? requestedLocale
      : routing.defaultLocale;

    // ==================== MESSAGE LOADING ====================

    const [
      common,
      user,
      product,
      navigation,
      appearance,
      language,
      presence,
      auth,
    ] = await Promise.all([
      import(`../../../messages/${locale}/common.json`),
      import(`../../../messages/${locale}/user.json`),
      import(`../../../messages/${locale}/product.json`),
      import(`../../../messages/${locale}/navigation.json`),
      import(`../../../messages/${locale}/appearance.json`),
      import(`../../../messages/${locale}/language.json`),
      import(`../../../messages/${locale}/presence.json`),
      import(`../../../messages/${locale}/auth.json`),
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
        auth: auth.default,
      },
    };
  }
);
