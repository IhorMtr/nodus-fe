'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@/shared/i18n/navigation';
import { routing } from '@/shared/i18n/routing';

import styles from './LocaleLinks.module.scss';

const localeLabels = { uk: 'UA', en: 'EN' } as const;
const localeNames = { uk: 'ukrainian', en: 'english' } as const;

export function LocaleLinks() {
  const locale = useLocale();
  const pathname = usePathname();
  const language = useTranslations('language');

  return (
    <nav className={styles.root} aria-label={language('label')}>
      {routing.locales.map(availableLocale => (
        <Link
          key={availableLocale}
          className={styles.option}
          href={pathname}
          locale={availableLocale}
          lang={availableLocale}
          hrefLang={availableLocale}
          aria-label={language(localeNames[availableLocale])}
          aria-current={availableLocale === locale ? 'page' : undefined}
        >
          {localeLabels[availableLocale]}
        </Link>
      ))}
    </nav>
  );
}
