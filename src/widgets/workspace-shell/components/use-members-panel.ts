'use client';

import { useLocale } from 'next-intl';
import { useMemo } from 'react';

import {
  getWorkspaceMemberName,
  useMemberManagement,
  useWorkspaceMembersQuery,
  type WorkspaceMember,
} from '@/domains/workspace/model/members';
import type { Workspace } from '@/domains/workspace/model/workspace';

// ==================== TYPES ====================

export interface MembersPanelGroup {
  key: 'online' | 'offline';
  members: WorkspaceMember[];
}

// ==================== MEMBERS PANEL STATE ====================

export function useMembersPanel(
  workspaceId: string,
  userId: string,
  role: Workspace['role']
) {
  // ==================== CONTEXT ====================

  const locale = useLocale();

  // ==================== QUERIES AND SCENARIOS ====================

  // Shares the cache with the profile menu; presence events patch it in place.
  const members = useWorkspaceMembersQuery(workspaceId);
  const management = useMemberManagement(workspaceId, userId, role);

  // ==================== DERIVED STATE ====================

  const groups = useMemo<MembersPanelGroup[]>(() => {
    const collator = new Intl.Collator(locale, { sensitivity: 'base' });
    const sorted = [...(members.data ?? [])].sort((a, b) =>
      collator.compare(getWorkspaceMemberName(a), getWorkspaceMemberName(b))
    );

    const online = sorted.filter(member => member.status !== 'offline');
    const offline = sorted.filter(member => member.status === 'offline');

    return [
      { key: 'online' as const, members: online },
      { key: 'offline' as const, members: offline },
    ].filter(group => group.members.length > 0);
  }, [members.data, locale]);

  // ==================== HANDLERS ====================

  const retry = () => {
    void members.refetch();
  };

  return {
    groups,
    total: members.data?.length ?? 0,
    loading: members.isPending,
    error: members.isError && !members.data,
    retry,
    management,
  };
}
