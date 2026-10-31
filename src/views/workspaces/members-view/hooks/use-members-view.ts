'use client';

import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { useWorkspaceMembersQuery } from '@/domains/workspace/model/members';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';

import { useInvitationManagement } from './use-invitation-management';
import { useMemberManagement } from './use-member-management';

// ==================== PAGE ORCHESTRATION ====================

export function useMembersView(workspaceId: string) {
  // ==================== QUERIES ====================

  const user = useCurrentUserQuery();
  const workspace = useWorkspaceQuery(workspaceId);
  const members = useWorkspaceMembersQuery(workspaceId);

  // ==================== PERMISSIONS AND SCENARIOS ====================

  const canManage =
    workspace.data?.role === 'Owner' || workspace.data?.role === 'Admin';
  const memberManagement = useMemberManagement(
    workspaceId,
    user.data?.id,
    workspace.data?.role
  );
  const invitationManagement = useInvitationManagement(workspaceId, canManage);

  // ==================== PAGE FEEDBACK ====================

  const retry = () => {
    if (user.isError) {
      void user.refetch();
    } else if (workspace.isError) {
      void workspace.refetch();
    } else {
      void members.refetch();
    }
  };

  const refreshMembers = () => {
    void members.refetch();
  };

  return {
    user,
    workspace,
    members,
    canManage,
    memberManagement,
    invitationManagement,
    retry,
    refreshMembers,
  };
}
