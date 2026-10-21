'use client';

import { Menu } from '@mantine/core';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { hasLocale, useLocale, useTranslations } from 'next-intl';

import { useRouter } from '@/shared/i18n/navigation';
import { routing } from '@/shared/i18n/routing';

import styles from './LocaleSelector.module.scss';

// ==================== LOCALES ====================

const localeNames = { uk: 'ukrainian', en: 'english' } as const;
const localeCodes = { uk: 'UA', en: 'EN' } as const;

// ==================== COMPONENT ====================

export function LocaleSelector() {
  const locale = useLocale();
  const router = useRouter();
  const language = useTranslations('language');

  // ==================== NAVIGATION ====================

  function changeLocale(value: string) {
    if (!hasLocale(routing.locales, value) || value === locale) return;

    router.replace('/', { locale: value, scroll: false });
  }

  // ==================== MENU ====================

  return (
    <Menu
      position="bottom-end"
      width={180}
      offset={8}
      shadow="none"
      checkIcon={<Check size={14} />}
      classNames={{ dropdown: styles.dropdown }}
    >
      <Menu.Target>
        <button
          type="button"
          className={styles.trigger}
          aria-label={`${language('label')}: ${language(localeNames[locale])}`}
        >
          <Languages size={16} />
          <span className={styles.fullLabel}>
            {language(localeNames[locale])}
          </span>
          <span className={styles.compactLabel}>{localeCodes[locale]}</span>
          <ChevronDown size={12} />
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.RadioGroup value={locale} onChange={changeLocale}>
          {routing.locales.map(availableLocale => (
            <Menu.RadioItem
              key={availableLocale}
              value={availableLocale}
              lang={availableLocale}
              closeMenuOnClick
              classNames={{
                item: styles.menuItem,
                itemIndicator: styles.indicator,
              }}
            >
              {language(localeNames[availableLocale])}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.Dropdown>
    </Menu>
  );
}
