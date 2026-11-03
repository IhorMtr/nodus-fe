'use client';

import { Menu } from '@mantine/core';
import { Check, ChevronUp, LogOut, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { selectablePresenceStatuses } from '@/domains/presence/model/presence-status';
import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import type { User } from '@/domains/user/model/current-user';
import { Link } from '@/shared/i18n/navigation';
import { Avatar } from '@/shared/ui/avatar';

import { useUserPresence } from '../hooks/use-user-presence';
import { useUserProfile } from '../hooks/use-user-profile';
import styles from './UserProfile.module.scss';

export function UserProfile({
  user,
  workspaceId,
  onNavigate,
}: {
  user: User;
  workspaceId: string;
  onNavigate?: () => void;
}) {
  // ==================== CONTEXT ====================

  const t = useTranslations('user');
  const presence = useTranslations('presence');

  // ==================== HOOKS ====================

  const { loggingOut, logout } = useUserProfile();
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
      <Menu position="top-start" width={250} withinPortal>
        {/* ==================== PROFILE TRIGGER ==================== */}

        <Menu.Target>
          <button
            type="button"
            className={styles.trigger}
            data-settings-return-focus
            aria-label={triggerLabel}
          >
            <Avatar
              initials={initials}
              size="md"
              className={styles.avatar}
              status={
                status && (
                  <PresenceIndicator status={status} withLabel={false} />
                )
              }
            />
            <span className={styles.identity}>
              <strong title={name}>{name}</strong>
              <span>{status ? presence(`status.${status}`) : user.email}</span>
            </span>
            <ChevronUp
              className={styles.chevron}
              size={16}
              aria-hidden="true"
            />
          </button>
        </Menu.Target>

        <Menu.Dropdown className={styles.dropdown}>
          <div className={styles.menuIdentity}>
            <Avatar initials={initials} size="lg" />
            <span className={styles.menuIdentityText}>
              <strong title={name}>{name}</strong>
              <span title={user.email}>{user.email}</span>
            </span>
          </div>
          <Menu.Divider />

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

          {/* ==================== PERSONAL SETTINGS ==================== */}

          <Menu.Item
            component={Link}
            href={{
              pathname: '/workspaces/[workspaceId]/personal-settings',
              params: { workspaceId },
            }}
            leftSection={<Settings size={16} aria-hidden="true" />}
            onClick={onNavigate}
          >
            {t('settings.title')}
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
