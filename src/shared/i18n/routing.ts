import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['uk', 'en'],
  defaultLocale: 'uk',
  localePrefix: 'always',
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/auth/login': '/auth/login',
    '/auth/register': '/auth/register',
    '/app': '/app',
    '/workspaces': '/workspaces',
  },
});
