'use client';

import {
  Menu,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { Check, ChevronUp, LogOut, Moon, Sun } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { authLifecycle } from '@/domains/auth/model/session';
import type { User } from '@/domains/user/model/current-user';
import { useRouter } from '@/shared/i18n/navigation';

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
  const locale = useLocale();
  const router = useRouter();
  const { setColorScheme } = useMantineColorScheme();
  const mounted = useMounted();
  const colorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const isDark = mounted && colorScheme === 'dark';
  const [loggingOut, setLoggingOut] = useState(false);
  const name = `${user.firstName} ${user.lastName}`.trim();
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  function switchLocale(nextLocale: 'uk' | 'en') {
    if (nextLocale === locale) return;
    onNavigate?.();
    const section = pathname.match(
      /\/(overview|conversations|announcements|search)$/
    )?.[1];

    if (channelId) {
      router.replace(
        {
          pathname: '/workspaces/[workspaceId]/channels/[channelId]',
          params: { workspaceId, channelId },
        },
        { locale: nextLocale, scroll: false }
      );
    } else if (
      section === 'overview' ||
      section === 'conversations' ||
      section === 'announcements' ||
      section === 'search'
    ) {
      router.replace(
        {
          pathname: `/workspaces/[workspaceId]/${section}`,
          params: { workspaceId },
        },
        { locale: nextLocale, scroll: false }
      );
    } else {
      router.replace(
        { pathname: '/workspaces/[workspaceId]', params: { workspaceId } },
        { locale: nextLocale, scroll: false }
      );
    }
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await authLifecycle.logout();
    } catch {
      // The local session is cleared even if upstream revocation fails.
    } finally {
      router.replace('/auth/login');
    }
  }

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
            onClick={() =>
              setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')
            }
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
