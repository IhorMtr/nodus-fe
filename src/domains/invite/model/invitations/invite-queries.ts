'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';
import { retryQuery } from '@/shared/query/retry-query';

import { inviteApi } from '../../api/invite-api';

const invitesKey = (workspaceId: string) => ['invites', workspaceId] as const;

export function useWorkspaceInvitesQuery(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: invitesKey(workspaceId),
    queryFn: ({ signal }) => inviteApi.list(workspaceId, signal),
    enabled: enabled && Boolean(workspaceId),
    networkMode: 'always',
    staleTime: 0,
    retry: retryQuery,
  });
}

export function useCreateInviteMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const version = authSessionEvents.getVersion();
      const invitation = await inviteApi.create(workspaceId);

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }

      return invitation;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invitesKey(workspaceId) });
    },
    networkMode: 'always',
    retry: false,
  });
}

export function useRevokeInviteMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const version = authSessionEvents.getVersion();
      await inviteApi.revoke(workspaceId, inviteId);

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invitesKey(workspaceId) });
    },
    networkMode: 'always',
    retry: false,
  });
}

export function useResolveInviteMutation() {
  return useMutation({
    mutationFn: inviteApi.resolve,
    networkMode: 'always',
    retry: false,
  });
}

export function useAcceptInviteMutation() {
  return useMutation({
    mutationFn: async (token: string) => {
      const version = authSessionEvents.getVersion();
      const membership = await inviteApi.accept(token);

      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }

      return membership;
    },
    networkMode: 'always',
    retry: false,
  });
}
