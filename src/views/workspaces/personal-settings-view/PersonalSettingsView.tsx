'use client';

import { Check, Palette, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { usePersonalSettings } from './use-personal-settings';
import styles from './PersonalSettingsView.module.scss';

// ==================== CONSTANTS ====================

const languageOptions = [
  { locale: 'uk', code: 'UA', labelKey: 'ukrainian' },
  { locale: 'en', code: 'EN', labelKey: 'english' },
] as const;

// ==================== VIEW ====================

export function PersonalSettingsView({
  layout = 'modal',
}: {
  layout?: 'modal' | 'standalone';
}) {
  // ==================== CONTEXT ====================

  const t = useTranslations('user.settings');
  const fields = useTranslations('user.fields');
  const language = useTranslations('language');
  const settings = usePersonalSettings();

  // ==================== RENDER ====================

  return (
    <div className={styles.page} data-layout={layout}>
      <div className={styles.layout}>
        {/* ==================== CATEGORY NAVIGATION ==================== */}

        <nav className={styles.navigation} aria-label={t('categories')}>
          <button
            type="button"
            aria-pressed={settings.category === 'account'}
            onClick={() => settings.setCategory('account')}
          >
            <UserRound size={17} aria-hidden="true" />
            {t('account')}
          </button>
          <button
            type="button"
            aria-pressed={settings.category === 'appearance'}
            onClick={() => settings.setCategory('appearance')}
          >
            <Palette size={17} aria-hidden="true" />
            {t('appearance')}
          </button>
        </nav>

        {/* ==================== ACCOUNT ==================== */}

        <div className={styles.content}>
          {settings.category === 'account' ? (
            <section aria-labelledby="personal-account">
              <div className={styles.heading}>
                <h2 id="personal-account">{t('account')}</h2>
                <p>{t('accountDetails')}</p>
              </div>
              {settings.user && (
                <>
                  <div className={styles.identity}>
                    <span className={styles.avatar} aria-hidden="true">
                      {`${settings.user.firstName.charAt(0)}${settings.user.lastName.charAt(0)}`.toUpperCase()}
                    </span>
                    <div>
                      <strong>
                        {`${settings.user.firstName} ${settings.user.lastName}`.trim()}
                      </strong>
                      <span>{settings.user.email}</span>
                    </div>
                  </div>
                  <dl className={styles.details}>
                    <div>
                      <dt>{fields('firstName')}</dt>
                      <dd>{settings.user.firstName}</dd>
                    </div>
                    <div>
                      <dt>{fields('lastName')}</dt>
                      <dd>{settings.user.lastName}</dd>
                    </div>
                    <div>
                      <dt>{fields('email')}</dt>
                      <dd>{settings.user.email}</dd>
                    </div>
                  </dl>
                </>
              )}
            </section>
          ) : (
            <section aria-labelledby="personal-appearance">
              <div className={styles.heading}>
                <h2 id="personal-appearance">{t('appearance')}</h2>
                <p>{t('description')}</p>
              </div>

              {/* ==================== THEME ==================== */}

              <div className={styles.preference}>
                <div>
                  <h3 id="personal-theme">{t('theme')}</h3>
                  <p>{t('appearanceDescription')}</p>
                </div>
                <div
                  className={styles.themeOptions}
                  role="group"
                  aria-labelledby="personal-theme"
                >
                  {(['light', 'dark'] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={
                        settings.mounted && settings.colorScheme === option
                      }
                      onClick={() => settings.setColorScheme(option)}
                    >
                      <span
                        className={styles.themePreview}
                        data-theme={option}
                        aria-hidden="true"
                      >
                        <span />
                        <span />
                      </span>
                      <span className={styles.themeLabel}>
                        {t(option)}
                        {settings.mounted &&
                          settings.colorScheme === option && (
                            <Check size={14} aria-hidden="true" />
                          )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ==================== LANGUAGE ==================== */}

              <div className={styles.preference}>
                <div>
                  <h3 id="personal-language">{t('language')}</h3>
                  <p>{t('languageDescription')}</p>
                </div>
                <div
                  className={styles.languageOptions}
                  role="radiogroup"
                  aria-labelledby="personal-language"
                >
                  {languageOptions.map(option => {
                    const selected = settings.locale === option.locale;

                    return (
                      <label
                        key={option.locale}
                        className={styles.languageOption}
                      >
                        <input
                          type="radio"
                          name="personal-language"
                          value={option.locale}
                          checked={selected}
                          onChange={() => settings.switchLocale(option.locale)}
                        />
                        <span
                          className={styles.languageCode}
                          aria-hidden="true"
                        >
                          {option.code}
                        </span>
                        <span className={styles.languageName}>
                          {language(option.labelKey)}
                        </span>
                        {selected && <Check size={14} aria-hidden="true" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
