import type appearance from '../../../messages/uk/appearance.json';
import type auth from '../../../messages/uk/auth.json';
import type channel from '../../../messages/uk/channel.json';
import type common from '../../../messages/uk/common.json';
import type language from '../../../messages/uk/language.json';
import type navigation from '../../../messages/uk/navigation.json';
import type product from '../../../messages/uk/product.json';
import type presence from '../../../messages/uk/presence.json';
import type user from '../../../messages/uk/user.json';
import type workspace from '../../../messages/uk/workspace.json';

import type { routing } from './routing';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: {
      appearance: typeof appearance;
      auth: typeof auth;
      channel: typeof channel;
      common: typeof common;
      language: typeof language;
      user: typeof user;
      product: typeof product;
      navigation: typeof navigation;
      presence: typeof presence;
      workspace: typeof workspace;
    };
  }
}
