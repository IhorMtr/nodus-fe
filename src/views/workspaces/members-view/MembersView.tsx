'use client';

import { useTranslations } from 'next-intl';

import { getInviteErrorKey } from '@/domains/invite/model/invitations';
import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import { MemberManagementDialogs } from '@/domains/workspace/ui/member-management';
import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Spinner } from '@/shared/ui/spinner';

import { InvitationsSection } from './components/InvitationsSection';
import { MembersList } from './components/MembersList';
import { useMembersView } from './hooks/use-members-view';
import styles from './MembersView.module.scss';

// ==================== PAGE VIEW ====================

export function MembersView({ workspaceId }: { workspaceId: string }) {
  // ==================== VIEW STATE ====================

  const t = useTranslations('invite');
  const presence = useTranslations('presence');
  const conversation = useTranslations('conversation');
  const overview = useTranslations('workspace.overview');
  const {
    workspace,
    members,
    user,
    canManage,
    retry,
    refreshMembers,
    memberManagement,
    invitationManagement,
    direct,
    messageMember,
  } = useMembersView(workspaceId);

  // ==================== LOADING STATE ====================

  if (workspace.isPending || members.isPending || user.isPending) {
    return (
      <div className={styles.state}>
        <Spinner label={t('members.loading')} />
      </div>
    );
  }

  // ==================== ERROR STATE ====================

  if (workspace.isError || members.isError || user.isError) {
    const error = workspace.error ?? members.error ?? user.error;

    return (
      <div className={styles.state} role="alert">
        <h1>{t('members.title')}</h1>
        <p>{t(`errors.${getInviteErrorKey(error)}`)}</p>
        <Button variant="secondary" onClick={retry}>
          {t('actions.retry')}
        </Button>
      </div>
    );
  }

  // ==================== DERIVED STATE ====================

  const onlineCount = members.data.filter(
    member => member.status === 'online'
  ).length;

  // ==================== RENDER ====================

  return (
    <div className={styles.page}>
      {/* ==================== PAGE HEADER ==================== */}

      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1>{t('members.title')}</h1>
          <p>{t('members.description', { workspace: workspace.data.name })}</p>
        </div>
        <p className={styles.summary}>
          <span>{overview('memberCount', { count: members.data.length })}</span>
          <span className={styles.summaryOnline}>
            <span aria-hidden="true">
              <PresenceIndicator status="online" withLabel={false} />
            </span>
            {presence('online', { count: onlineCount })}
          </span>
        </p>
      </header>

      <div
        className={styles.layout}
        data-with-invitations={canManage || undefined}
      >
        {/* ==================== MEMBERS ==================== */}

        <div className={styles.membersColumn}>
          <MembersList
            members={members.data}
            currentUserId={user.data.id}
            onMessage={member => void messageMember(member.userId)}
            messagePending={direct.isPending}
            isFetching={members.isFetching}
            onRefresh={refreshMembers}
            canChangeRole={memberManagement.canChangeRole}
            canRemove={memberManagement.canRemove}
            onChangeRole={memberManagement.openRole}
            onRemove={memberManagement.openRemove}
          />
          {direct.isError && (
            <InlineStatus tone="danger" role="alert">
              {conversation('openError')}
            </InlineStatus>
          )}
        </div>

        {/* ==================== INVITATIONS ==================== */}

        <InvitationsSection
          state={invitationManagement}
          canManage={canManage}
        />
      </div>

      {/* ==================== MEMBER MANAGEMENT ==================== */}

      <MemberManagementDialogs state={memberManagement} />
    </div>
  );
}
