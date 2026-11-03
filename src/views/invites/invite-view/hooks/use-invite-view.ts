'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

import { authLifecycle, useAuthSession } from '@/domains/auth/model/session';
import {
  getInviteErrorKey,
  inviteStorage,
  useAcceptInviteMutation,
  useResolveInviteMutation,
} from '@/domains/invite/model/invitations';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import { workspaceQueryKeys } from '@/domains/workspace/model/workspace';
import { useRouter } from '@/shared/i18n/navigation';

// ==================== FINAL INVITATION ERRORS ====================

const finalErrors = new Set([
  'InviteNotFound',
  'InviteExpired',
  'InviteRevoked',
  'InviteAlreadyUsed',
  'AlreadyWorkspaceMember',
]);

export function useInviteView() {
  // ==================== CONTEXT AND STATE ====================

  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useAuthSession();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // ==================== MUTATIONS AND QUERIES ====================

  const resolved = useResolveInviteMutation();
  const accept = useAcceptInviteMutation();
  const user = useCurrentUserQuery({ enabled: status === 'authenticated' });
  const resolveInvite = resolved.mutate;

  // ==================== DERIVED STATE ====================

  const acceptErrorKey = accept.isError
    ? getInviteErrorKey(accept.error)
    : null;
  const cannotRetryAcceptance =
    acceptErrorKey !== null && finalErrors.has(acceptErrorKey);
  const resolveErrorKey = resolved.isError
    ? getInviteErrorKey(resolved.error)
    : null;
  const canRetryResolve =
    resolveErrorKey === 'networkError' || resolveErrorKey === 'requestFailed';

  // ==================== INVITE AND SESSION RESTORATION ====================

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const incomingToken = fragment.get('token');

    if (incomingToken) {
      inviteStorage.set(incomingToken);
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }

    const pendingToken = incomingToken ?? inviteStorage.get();
    queueMicrotask(() => {
      setToken(pendingToken);
      setReady(true);
    });

    void authLifecycle.initialize().catch(() => {});
  }, []);

  useEffect(() => {
    if (token) {
      resolveInvite(token);
    }
  }, [token, resolveInvite]);

  useEffect(() => {
    if (
      resolved.isError &&
      finalErrors.has(getInviteErrorKey(resolved.error))
    ) {
      inviteStorage.clear();
    }
  }, [resolved.isError, resolved.error]);

  // ==================== ACCEPTANCE AND NAVIGATION ====================

  const acceptInvite = async () => {
    if (!token) {
      return;
    }

    try {
      const membership = await accept.mutateAsync(token);
      inviteStorage.clear();

      if (user.data) {
        workspaceNavigation.setLastWorkspaceId(
          user.data.id,
          membership.workspaceId
        );
      }

      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list });
      router.replace({
        pathname: '/workspaces/[workspaceId]',
        params: { workspaceId: membership.workspaceId },
      });
    } catch (error) {
      if (finalErrors.has(getInviteErrorKey(error))) {
        inviteStorage.clear();
      }
    }
  };

  const decline = () => {
    inviteStorage.clear();
    router.replace(status === 'authenticated' ? '/app' : '/');
  };

  const retryResolve = () => {
    if (token) {
      resolved.mutate(token);
    }
  };

  const retrySession = () => {
    void authLifecycle.initialize({ retry: true }).catch(() => {});
  };

  // ==================== DISPLAY DATA ====================

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(value));

  return {
    status,
    token,
    ready,
    resolved,
    accept,
    acceptErrorKey,
    cannotRetryAcceptance,
    resolveErrorKey,
    canRetryResolve,
    acceptInvite,
    decline,
    retryResolve,
    retrySession,
    formatDate,
  };
}
