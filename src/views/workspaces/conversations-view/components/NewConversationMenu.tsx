'use client';

import { Menu } from '@mantine/core';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import {
  getWorkspaceMemberInitials,
  getWorkspaceMemberName,
  type WorkspaceMember,
} from '@/domains/workspace/model/members';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';

import styles from './NewConversationMenu.module.scss';

// ==================== TYPES ====================

interface NewConversationMenuProps {
  members: WorkspaceMember[];
  loading: boolean;
  error: boolean;
  ready: boolean;
  disabled: boolean;
  variant?: 'primary' | 'secondary';
  onRetry: () => void;
  onSelect: (userId: string) => void;
}

// ==================== RENDER ====================

export function NewConversationMenu({
  members,
  loading,
  error,
  ready,
  disabled,
  variant = 'secondary',
  onRetry,
  onSelect,
}: NewConversationMenuProps) {
  const t = useTranslations('conversation');
  const workspace = useTranslations('workspace');

  return (
    <Menu withinPortal position="bottom-end" width={280}>
      {/* ==================== TRIGGER ==================== */}

      <Menu.Target>
        <Button variant={variant} size="sm" leftIcon={<Plus />}>
          {t('new')}
        </Button>
      </Menu.Target>

      {/* ==================== MEMBER PICKER ==================== */}

      <Menu.Dropdown className={styles.dropdown}>
        <Menu.Label>{t('chooseMember')}</Menu.Label>

        {loading && <Menu.Label>{t('loadingMembers')}</Menu.Label>}

        {error && (
          <Menu.Item onClick={onRetry}>{workspace('actions.retry')}</Menu.Item>
        )}

        {members.map(member => (
          <Menu.Item
            key={member.userId}
            disabled={disabled}
            leftSection={
              <Avatar
                initials={getWorkspaceMemberInitials(member)}
                size="sm"
                className={styles.avatar}
                status={
                  <PresenceIndicator status={member.status} withLabel={false} />
                }
              />
            }
            onClick={() => onSelect(member.userId)}
          >
            <span className={styles.name}>
              {getWorkspaceMemberName(member)}
            </span>
          </Menu.Item>
        ))}

        {ready && members.length === 0 && (
          <Menu.Label>{t('noMembers')}</Menu.Label>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
