'use client';

import { Menu } from '@mantine/core';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import {
  getWorkspaceMemberInitials,
  getWorkspaceMemberName,
  type WorkspaceMember,
} from '@/domains/workspace/model/members';
import { MemberActionItems } from '@/domains/workspace/ui/member-management';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';

import styles from './MembersList.module.scss';

// ==================== TYPES ====================

interface MembersListProps {
  members: WorkspaceMember[];
  currentUserId: string;
  onMessage: (member: WorkspaceMember) => void;
  messagePending: boolean;
  isFetching: boolean;
  onRefresh: () => void;
  canChangeRole: (member: WorkspaceMember) => boolean;
  canRemove: (member: WorkspaceMember) => boolean;
  onChangeRole: (member: WorkspaceMember) => void;
  onRemove: (member: WorkspaceMember) => void;
}

// ==================== MEMBER LIST ====================

export function MembersList({
  members,
  currentUserId,
  onMessage,
  messagePending,
  isFetching,
  onRefresh,
  canChangeRole,
  canRemove,
  onChangeRole,
  onRemove,
}: MembersListProps) {
  // ==================== CONTEXT ====================

  const t = useTranslations('invite');
  const management = useTranslations('workspace.management');

  // ==================== RENDER ====================

  return (
    <section className={styles.section} aria-labelledby="members-heading">
      {/* ==================== SECTION HEADER ==================== */}

      <div className={styles.sectionHeader}>
        <h2 id="members-heading">{t('members.listTitle')}</h2>
        <span className={styles.count}>{members.length}</span>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw />}
          onClick={onRefresh}
          disabled={isFetching}
          className={styles.refresh}
        >
          {t('actions.refresh')}
        </Button>
      </div>

      {members.length === 0 && (
        <p className={styles.empty}>{t('members.empty')}</p>
      )}

      {/* ==================== MEMBER TABLE ==================== */}

      {members.length > 0 && (
        <div className={styles.table}>
          <div className={styles.columns} aria-hidden="true">
            <span>{t('members.person')}</span>
            <span className={styles.presenceColumn}>
              {t('members.presence')}
            </span>
            <span className={styles.roleColumn}>{t('members.role')}</span>
          </div>

          <ul className={styles.rows}>
            {members.map(member => {
              const name = getWorkspaceMemberName(member);
              const allowRole = canChangeRole(member);
              const allowRemove = canRemove(member);
              const canMessage = member.userId !== currentUserId;
              const hasActions = canMessage || allowRole || allowRemove;

              return (
                <li
                  key={member.userId}
                  className={styles.row}
                  data-offline={member.status === 'offline' || undefined}
                >
                  {/* ==================== PERSON ==================== */}

                  <div className={styles.person}>
                    <Avatar
                      initials={getWorkspaceMemberInitials(member)}
                      size="md"
                      className={styles.avatar}
                    />
                    <div className={styles.identity}>
                      <strong title={name}>{name}</strong>
                      <span title={member.email}>{member.email}</span>
                    </div>
                  </div>

                  {/* ==================== STATUS AND ROLE ==================== */}

                  <PresenceIndicator
                    status={member.status}
                    className={styles.presence}
                  />
                  <span className={styles.role} data-role={member.role}>
                    {t(`roles.${member.role}`)}
                  </span>

                  {/* ==================== ACTIONS ==================== */}

                  <div className={styles.actions}>
                    {hasActions && (
                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <IconButton
                            icon={<MoreHorizontal />}
                            variant="ghost"
                            size="sm"
                            aria-label={management('memberActions', { name })}
                          />
                        </Menu.Target>
                        <Menu.Dropdown>
                          <MemberActionItems
                            member={member}
                            canChangeRole={allowRole}
                            canRemove={allowRemove}
                            onChangeRole={onChangeRole}
                            onRemove={onRemove}
                            canMessage={canMessage}
                            onMessage={onMessage}
                            messagePending={messagePending}
                          />
                        </Menu.Dropdown>
                      </Menu>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
