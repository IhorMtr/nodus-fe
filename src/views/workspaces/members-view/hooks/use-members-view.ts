'use client';

import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import {
  useMemberManagement,
  useWorkspaceMembersQuery,
} from '@/domains/workspace/model/members';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';
import { useOpenConversationMutation } from '@/domains/conversation/model/conversations';
import { useRouter } from '@/shared/i18n/navigation';
import { useRef } from 'react';

import { useInvitationManagement } from './use-invitation-management';

// ==================== PAGE ORCHESTRATION ====================

export function useMembersView(workspaceId: string) {
  const router = useRouter();
  const openingRef = useRef(false);
  // ==================== QUERIES ====================

  const user = useCurrentUserQuery();
  const workspace = useWorkspaceQuery(workspaceId);
  const members = useWorkspaceMembersQuery(workspaceId);
  const direct = useOpenConversationMutation(workspaceId);

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

  // ==================== DIRECT CONVERSATION ====================

  const messageMember = async (memberId: string) => {
    if (
      !user.data ||
      openingRef.current ||
      memberId === user.data?.id ||
      !members.data?.some(member => member.userId === memberId)
    ) {
      return;
    }
    openingRef.current = true;
    try {
      const conversation = await direct.mutateAsync(memberId);
      router.push({
        pathname: '/workspaces/[workspaceId]/conversations/[conversationId]',
        params: { workspaceId, conversationId: conversation.id },
      });
    } catch {
    } finally {
      openingRef.current = false;
    }
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
    direct,
    messageMember,
  };
}
