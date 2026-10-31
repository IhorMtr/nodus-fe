'use client';

import { useState } from 'react';

import {
  useChangeWorkspaceMemberRoleMutation,
  useRemoveWorkspaceMemberMutation,
  type WorkspaceMember,
} from '@/domains/workspace/model/members';

// ==================== MEMBER MANAGEMENT ====================

export function useMemberManagement(
  workspaceId: string,
  currentUserId: string | undefined,
  workspaceRole: 'Owner' | 'Admin' | 'Member' | undefined
) {
  // ==================== MUTATIONS AND STATE ====================

  const changeRole = useChangeWorkspaceMemberRoleMutation(workspaceId);
  const removeMember = useRemoveWorkspaceMemberMutation(workspaceId);
  const [roleTarget, setRoleTarget] = useState<WorkspaceMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Member'>(
    'Member'
  );

  // ==================== PERMISSIONS ====================

  const canRemove = (member: WorkspaceMember) =>
    member.userId !== currentUserId &&
    member.role !== 'Owner' &&
    (workspaceRole === 'Owner' ||
      (workspaceRole === 'Admin' && member.role === 'Member'));

  const canChangeRole = (member: WorkspaceMember) =>
    workspaceRole === 'Owner' &&
    member.userId !== currentUserId &&
    member.role !== 'Owner';

  // ==================== ROLE HANDLERS ====================

  const openRole = (member: WorkspaceMember) => {
    changeRole.reset();
    setSelectedRole(member.role === 'Admin' ? 'Admin' : 'Member');
    setRoleTarget(member);
  };

  const closeRole = () => {
    if (!changeRole.isPending) {
      setRoleTarget(null);
    }
  };

  const saveRole = async () => {
    if (!roleTarget || !canChangeRole(roleTarget)) {
      return;
    }

    try {
      await changeRole.mutateAsync({
        userId: roleTarget.userId,
        role: selectedRole,
      });
      setRoleTarget(null);
    } catch {
      // The mutation error stays visible in the dialog.
    }
  };

  // ==================== REMOVAL HANDLERS ====================

  const openRemove = (member: WorkspaceMember) => {
    removeMember.reset();
    setRemoveTarget(member);
  };

  const closeRemove = () => {
    if (!removeMember.isPending) {
      setRemoveTarget(null);
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget || !canRemove(removeTarget)) {
      return;
    }

    try {
      await removeMember.mutateAsync(removeTarget.userId);
      setRemoveTarget(null);
    } catch {
      // The mutation error stays visible in the dialog.
    }
  };

  return {
    changeRole,
    removeMember,
    roleTarget,
    removeTarget,
    selectedRole,
    setSelectedRole,
    canRemove,
    canChangeRole,
    openRole,
    closeRole,
    saveRole,
    openRemove,
    closeRemove,
    confirmRemove,
  };
}
