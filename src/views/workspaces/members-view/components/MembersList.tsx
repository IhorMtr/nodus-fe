'use client';

import { Menu } from '@mantine/core';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import {
  getWorkspaceMemberName,
  type WorkspaceMember,
} from '@/domains/workspace/model/members';
import { MemberActionItems } from '@/domains/workspace/ui/member-management';
import { Button } from '@/shared/ui/button';

import styles from '../MembersView.module.scss';

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
}: {
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
}) {
  // ==================== CONTEXT ====================

  const t = useTranslations('invite');
  const management = useTranslations('workspace.management');

  // ==================== HELPERS ====================

  const initialsOf = (member: WorkspaceMember) =>
    `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();

  // ==================== RENDER ====================

  return (
    <section className={styles.section} aria-labelledby="members-heading">
      {/* ==================== SECTION HEADER ==================== */}

      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeading}>
          <h2 id="members-heading">{t('members.listTitle')}</h2>
          <span className={styles.count}>{members.length}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw size={15} />}
          onClick={onRefresh}
          disabled={isFetching}
        >
          {t('actions.refresh')}
        </Button>
      </div>

      {/* ==================== MEMBER ROWS ==================== */}

      {members.length === 0 ? (
        <p className={styles.empty}>{t('members.empty')}</p>
      ) : (
        <div className={styles.listFrame}>
          <div className={styles.columnHeaders} aria-hidden="true">
            <span className={styles.nameHeading}>{t('members.person')}</span>
            <div className={styles.memberMeta}>
              <span className={styles.presence}>{t('members.presence')}</span>
              <span className={styles.role}>{t('members.role')}</span>
            </div>
          </div>
          <ul className={`${styles.list} ${styles.memberList}`}>
            {members.map(member => (
              <li key={member.userId} className={styles.row}>
                <span className={styles.avatar} aria-hidden="true">
                  {initialsOf(member)}
                </span>
                <div className={styles.person}>
                  <strong>
                    {member.firstName} {member.lastName}
                  </strong>
                  <span>{member.email}</span>
                </div>
                <div className={styles.memberMeta}>
                  <PresenceIndicator
                    status={member.status}
                    className={styles.presence}
                  />
                  <span className={styles.role} data-role={member.role}>
                    {t(`roles.${member.role}`)}
                  </span>
                </div>
                <div className={styles.rowActions}>
                  {(member.userId !== currentUserId ||
                    canChangeRole(member) ||
                    canRemove(member)) && (
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <button
                          type="button"
                          className={styles.moreAction}
                          aria-label={management('memberActions', {
                            name: getWorkspaceMemberName(member),
                          })}
                        >
                          <MoreHorizontal size={18} aria-hidden="true" />
                        </button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <MemberActionItems
                          member={member}
                          canChangeRole={canChangeRole(member)}
                          canRemove={canRemove(member)}
                          onChangeRole={onChangeRole}
                          onRemove={onRemove}
                          canMessage={member.userId !== currentUserId}
                          onMessage={onMessage}
                          messagePending={messagePending}
                        />
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
