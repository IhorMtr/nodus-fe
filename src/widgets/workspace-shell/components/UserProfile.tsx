'use client';

import { Menu } from '@mantine/core';
import { Check, ChevronUp, LogOut, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { selectablePresenceStatuses } from '@/domains/presence/model/presence-status';
import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import type { User } from '@/domains/user/model/current-user';

import { useUserPresence } from './use-user-presence';
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
  // ==================== CONTEXT ====================

  const t = useTranslations('user');
  const presence = useTranslations('presence');
  const appearance = useTranslations('appearance');
  const language = useTranslations('language');

  // ==================== HOOKS ====================

  const {
    locale,
    isDark,
    loggingOut,
    toggleColorScheme,
    switchLocale,
    logout,
  } = useUserProfile(workspaceId, pathname, channelId, onNavigate);
  const { status, updating, selectStatus } = useUserPresence(
    workspaceId,
    user.id
  );

  // ==================== DERIVED STATE ====================

  const name = `${user.firstName} ${user.lastName}`.trim();
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const triggerLabel = status
    ? `${t('profile.menu')}. ${presence('menu.current', {
        status: presence(`status.${status}`),
      })}`
    : t('profile.menu');

  // ==================== RENDER ====================

  return (
    <div className={styles.profile}>
      <Menu position="top-start" width={250} shadow="sm" withinPortal>
        {/* ==================== PROFILE TRIGGER ==================== */}

        <Menu.Target>
          <button
            type="button"
            className={styles.trigger}
            aria-label={triggerLabel}
          >
            <span className={styles.avatar} aria-hidden="true">
              {initials}
            </span>
            <span className={styles.identity}>
              <strong title={name}>{name}</strong>
              {status && <PresenceIndicator status={status} />}
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

          {/* ==================== PRESENCE STATUS ==================== */}

          <Menu.Label>{presence('menu.label')}</Menu.Label>
          {selectablePresenceStatuses.map(option => (
            <Menu.Item
              key={option}
              leftSection={
                <span aria-hidden="true">
                  <PresenceIndicator status={option} withLabel={false} />
                </span>
              }
              rightSection={
                status === option ? (
                  <Check size={16} aria-hidden="true" />
                ) : null
              }
              aria-checked={status === option}
              role="menuitemradio"
              disabled={updating}
              onClick={() => selectStatus(option)}
            >
              {presence(`status.${option}`)}
            </Menu.Item>
          ))}
          <Menu.Divider />

          {/* ==================== APPEARANCE ==================== */}

          <Menu.Item
            leftSection={isDark ? <Sun size={16} /> : <Moon size={16} />}
            onClick={toggleColorScheme}
          >
            {appearance(
              isDark ? 'actions.switchToLight' : 'actions.switchToDark'
            )}
          </Menu.Item>

          {/* ==================== LANGUAGE ==================== */}

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

          {/* ==================== SESSION ==================== */}

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
