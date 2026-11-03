'use client';

import { Menu } from '@mantine/core';
import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

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
import { Spinner } from '@/shared/ui/spinner';

import styles from './MembersPanel.module.scss';
import type { MembersPanelGroup } from './use-members-panel';

// ==================== TYPES ====================

interface MemberActionsProps {
  currentUserId: string;
  onMessage: (member: WorkspaceMember) => void;
  messagePending: boolean;
  canChangeRole: (member: WorkspaceMember) => boolean;
  canRemove: (member: WorkspaceMember) => boolean;
  onChangeRole: (member: WorkspaceMember) => void;
  onRemove: (member: WorkspaceMember) => void;
}

interface MembersPanelProps extends MemberActionsProps {
  messageError: boolean;
  groups: MembersPanelGroup[];
  total: number;
  loading: boolean;
  error: boolean;
  withHeading?: boolean;
  onRetry: () => void;
}

interface MemberRowProps extends MemberActionsProps {
  member: WorkspaceMember;
}

// ==================== MEMBER ROW ====================

function MemberRow({
  member,
  canChangeRole,
  canRemove,
  onChangeRole,
  onRemove,
  currentUserId,
  onMessage,
  messagePending,
}: MemberRowProps) {
  // ==================== CONTEXT ====================

  const roles = useTranslations('invite.roles');
  const management = useTranslations('workspace.management');

  // ==================== DERIVED STATE ====================

  const name = getWorkspaceMemberName(member);
  const allowRole = canChangeRole(member);
  const allowRemove = canRemove(member);
  const canMessage = member.userId !== currentUserId;
  const manageable = canMessage || allowRole || allowRemove;
  const actions = (
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
  );

  // ==================== ROW CONTENT ====================

  const row = (
    <li
      className={styles.row}
      data-offline={member.status === 'offline' || undefined}
    >
      {/* ==================== IDENTITY ==================== */}

      <Avatar
        initials={getWorkspaceMemberInitials(member)}
        size="sm"
        className={styles.avatar}
        status={<PresenceIndicator status={member.status} withLabel={false} />}
      />
      <span className={styles.identity}>
        <span className={styles.name} title={name}>
          {name}
        </span>
        <span className={styles.role}>{roles(member.role)}</span>
      </span>

      {/* ==================== QUICK ACTIONS ==================== */}

      {manageable && (
        <Menu position="bottom-end" shadow="sm" withinPortal>
          <Menu.Target>
            <IconButton
              icon={<MoreHorizontal />}
              variant="ghost"
              size="sm"
              className={styles.more}
              aria-label={management('memberActions', { name })}
            />
          </Menu.Target>
          <Menu.Dropdown>{actions}</Menu.Dropdown>
        </Menu>
      )}
    </li>
  );

  // ==================== RENDER ====================

  if (!manageable) {
    return row;
  }

  return (
    <Menu position="bottom-start" shadow="sm" withinPortal>
      <Menu.ContextMenu>{row}</Menu.ContextMenu>
      <Menu.Dropdown>{actions}</Menu.Dropdown>
    </Menu>
  );
}

// ==================== MEMBERS PANEL ====================

export function MembersPanel({
  groups,
  total,
  loading,
  error,
  withHeading = true,
  onRetry,
  messageError,
  ...actions
}: MembersPanelProps) {
  // ==================== CONTEXT ====================

  const t = useTranslations('workspace.membersPanel');
  const workspace = useTranslations('workspace');
  const invite = useTranslations('invite.members');
  const conversation = useTranslations('conversation');
  const headingId = useId();

  // ==================== RENDER ====================

  return (
    <aside
      className={styles.panel}
      aria-labelledby={withHeading ? headingId : undefined}
      aria-label={withHeading ? undefined : t('title')}
    >
      {/* ==================== PANEL HEADING ==================== */}

      {withHeading && (
        <div className={styles.heading}>
          <h2 id={headingId}>{t('title')}</h2>
          {!loading && !error && <span className={styles.count}>{total}</span>}
        </div>
      )}

      <div className={styles.scrollArea}>
        {/* ==================== LOADING AND ERROR STATES ==================== */}

        {loading && (
          <div className={styles.state}>
            <Spinner label={invite('loading')} />
          </div>
        )}

        {error && (
          <div className={styles.state} role="status">
            <p>{t('loadError')}</p>
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {workspace('actions.retry')}
            </Button>
          </div>
        )}

        {messageError && (
          <div className={styles.state} role="alert">
            <p>{conversation('openError')}</p>
          </div>
        )}

        {!loading && !error && total === 0 && (
          <p className={styles.state}>{invite('empty')}</p>
        )}

        {/* ==================== MEMBER GROUPS ==================== */}

        {!loading &&
          !error &&
          groups.map(group => (
            <section
              key={group.key}
              className={styles.group}
              aria-labelledby={`${headingId}-${group.key}`}
            >
              <h3 id={`${headingId}-${group.key}`}>
                {t(group.key, { count: group.members.length })}
              </h3>
              <ul className={styles.list}>
                {group.members.map(member => (
                  <MemberRow key={member.userId} member={member} {...actions} />
                ))}
              </ul>
            </section>
          ))}
      </div>
    </aside>
  );
}
