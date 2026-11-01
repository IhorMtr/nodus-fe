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
  isFetching,
  onRefresh,
  canChangeRole,
  canRemove,
  onChangeRole,
  onRemove,
}: {
  members: WorkspaceMember[];
  isFetching: boolean;
  onRefresh: () => void;
  canChangeRole: (member: WorkspaceMember) => boolean;
  canRemove: (member: WorkspaceMember) => boolean;
  onChangeRole: (member: WorkspaceMember) => void;
  onRemove: (member: WorkspaceMember) => void;
}) {
  const t = useTranslations('invite');
  const management = useTranslations('workspace.management');

  // ==================== RENDER ====================

  return (
    <section className={styles.section} aria-labelledby="members-heading">
      <div className={styles.sectionHeader}>
        <h2 id="members-heading">{t('members.listTitle')}</h2>
        <div className={styles.headingActions}>
          <span className={styles.count}>{members.length}</span>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={15} />}
            onClick={onRefresh}
            disabled={isFetching}
          >
            {t('actions.refresh')}
          </Button>
        </div>
      </div>
      {/* ==================== MEMBER ROWS ==================== */}

      {members.length === 0 ? (
        <p className={styles.empty}>{t('members.empty')}</p>
      ) : (
        <ul className={`${styles.list} ${styles.memberList}`}>
          {members.map(member => (
            <li key={member.userId} className={styles.row}>
              <div className={styles.person}>
                <strong>
                  {member.firstName} {member.lastName}
                </strong>
                <span>{member.email}</span>
              </div>
              <div className={styles.memberActions}>
                <PresenceIndicator
                  status={member.status}
                  className={styles.presence}
                />
                <span className={styles.role}>{t(`roles.${member.role}`)}</span>
                {(canChangeRole(member) || canRemove(member)) && (
                  <Menu position="bottom-end" shadow="sm" withinPortal>
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
                      />
                    </Menu.Dropdown>
                  </Menu>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
