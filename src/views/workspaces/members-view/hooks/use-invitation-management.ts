'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';

import {
  useCreateInviteMutation,
  useRevokeInviteMutation,
  useWorkspaceInvitesQuery,
} from '@/domains/invite/model/invitations';

// ==================== INVITATION MANAGEMENT ====================

export function useInvitationManagement(
  workspaceId: string,
  canManage: boolean
) {
  // ==================== QUERIES AND MUTATIONS ====================

  const locale = useLocale();
  const invites = useWorkspaceInvitesQuery(workspaceId, canManage);
  const create = useCreateInviteMutation(workspaceId);
  const revoke = useRevokeInviteMutation(workspaceId);

  // ==================== SHARE STATE ====================

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'copied' | 'failed' | null>(null);

  // ==================== INVITATION ACTIONS ====================

  const createInvite = async () => {
    try {
      const invitation = await create.mutateAsync();
      const link = `${window.location.origin}/${locale}/invites#token=${encodeURIComponent(invitation.token)}`;

      setCopyState(null);
      setInviteLink(link);
    } catch {
      // The mutation error is displayed beside the action.
    }
  };

  const revokeInvite = (inviteId: string) => {
    revoke.mutate(inviteId);
  };

  const retryInvites = () => {
    void invites.refetch();
  };

  // ==================== SHARE ACTIONS ====================

  const copyInvite = async () => {
    if (!inviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  const closeInvite = () => {
    setInviteLink(null);
    setCopyState(null);
    create.reset();
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return {
    invites,
    create,
    revoke,
    inviteLink,
    copyState,
    createInvite,
    revokeInvite,
    retryInvites,
    copyInvite,
    closeInvite,
    formatDate,
  };
}
