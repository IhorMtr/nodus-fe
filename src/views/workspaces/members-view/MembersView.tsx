'use client';

import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getInviteErrorKey } from '@/domains/invite/model/invitations';
import { MemberManagementDialogs } from '@/domains/workspace/ui/member-management';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import { InvitationsSection } from './components/InvitationsSection';
import { MembersList } from './components/MembersList';
import styles from './MembersView.module.scss';
import { useMembersView } from './hooks/use-members-view';

export function MembersView({ workspaceId }: { workspaceId: string }) {
  const t = useTranslations('invite');
  const {
    workspace,
    members,
    user,
    canManage,
    retry,
    refreshMembers,
    memberManagement,
    invitationManagement,
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

  // ==================== RENDER ====================

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <span className={styles.icon}>
          <Users size={22} aria-hidden="true" />
        </span>
        <div>
          <h1>{t('members.title')}</h1>
          <p>{t('members.description', { workspace: workspace.data.name })}</p>
        </div>
      </header>

      {/* ==================== MEMBERS LIST ==================== */}

      <MembersList
        members={members.data}
        isFetching={members.isFetching}
        onRefresh={refreshMembers}
        canChangeRole={memberManagement.canChangeRole}
        canRemove={memberManagement.canRemove}
        onChangeRole={memberManagement.openRole}
        onRemove={memberManagement.openRemove}
      />

      {/* ==================== INVITATIONS ==================== */}

      <InvitationsSection state={invitationManagement} canManage={canManage} />

      {/* ==================== MEMBER MANAGEMENT ==================== */}

      <MemberManagementDialogs state={memberManagement} />
    </div>
  );
}
