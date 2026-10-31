'use client';

import { Menu } from '@mantine/core';
import { Check, ChevronUp, LogOut, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { User } from '@/domains/user/model/current-user';

import { useUserProfile } from './use-user-profile';
import styles from './UserProfile.module.scss';

export function UserProfile({
  user,
  workspaceId,
  pathname,
  channelId,
  onNavigate,
}: {
  user: User;
  workspaceId: string;
  pathname: string;
  channelId?: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations('user');
  const appearance = useTranslations('appearance');
  const language = useTranslations('language');
  const {
    locale,
    isDark,
    loggingOut,
    toggleColorScheme,
    switchLocale,
    logout,
  } = useUserProfile(workspaceId, pathname, channelId, onNavigate);
  const name = `${user.firstName} ${user.lastName}`.trim();
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  // ==================== RENDER ====================
  return (
    <div className={styles.profile}>
      <Menu position="top-start" width={250} shadow="sm" withinPortal>
        <Menu.Target>
          <button
            type="button"
            className={styles.trigger}
            aria-label={t('profile.menu')}
          >
            <span className={styles.avatar} aria-hidden="true">
              {initials}
            </span>
            <span className={styles.identity}>
              <strong title={name}>{name}</strong>
              <span className={styles.status}>
                <i aria-hidden="true" />
                {t('profile.online')}
              </span>
            </span>
            <ChevronUp
              className={styles.chevron}
              size={16}
              aria-hidden="true"
            />
          </button>
        </Menu.Target>
        <Menu.Dropdown className={styles.dropdown}>
          <Menu.Label>{name}</Menu.Label>
          <Menu.Item
            leftSection={isDark ? <Sun size={16} /> : <Moon size={16} />}
            onClick={toggleColorScheme}
          >
            {appearance(
              isDark ? 'actions.switchToLight' : 'actions.switchToDark'
            )}
          </Menu.Item>
          <Menu.Label>{language('label')}</Menu.Label>
          <Menu.Item
            rightSection={locale === 'uk' ? <Check size={16} /> : null}
            onClick={() => switchLocale('uk')}
          >
            {language('ukrainian')}
          </Menu.Item>
          <Menu.Item
            rightSection={locale === 'en' ? <Check size={16} /> : null}
            onClick={() => switchLocale('en')}
          >
            {language('english')}
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<LogOut size={16} />}
            onClick={() => void logout()}
            disabled={loggingOut}
          >
            {t('actions.logout')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
