'use client';

import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

import {
  useUpdatePresenceStatusMutation,
  type SelectablePresenceStatus,
} from '@/domains/presence/model/presence-status';
import {
  applyWorkspaceMemberPresence,
  useWorkspaceMembersQuery,
} from '@/domains/workspace/model/members';

// ==================== OWN PRESENCE ====================

export function useUserPresence(workspaceId: string, userId: string) {
  // ==================== CONTEXT ====================

  const t = useTranslations('presence');
  const queryClient = useQueryClient();

  // ==================== QUERIES AND MUTATIONS ====================

  const members = useWorkspaceMembersQuery(workspaceId);
  const updateStatus = useUpdatePresenceStatusMutation();

  // ==================== DERIVED STATE ====================

  const status = members.data?.find(
    member => member.userId.toLowerCase() === userId.toLowerCase()
  )?.status;

  // ==================== HANDLERS ====================

  const selectStatus = (next: SelectablePresenceStatus) => {
    if (updateStatus.isPending || next === status) {
      return;
    }

    updateStatus.mutate(next, {
      onSuccess: update => {
        applyWorkspaceMemberPresence(queryClient, update);
      },
      onError: () => {
        notifications.show({
          color: 'red',
          message: t('errors.updateFailed'),
        });
      },
    });
  };

  return {
    status,
    updating: updateStatus.isPending,
    selectStatus,
  };
}
