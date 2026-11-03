'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelApi } from '../../api/channel-api';
import { withCurrentSession } from '../channel/channel-mutations';
import { channelQueryKeys } from '../channel/channel-queries';

// ==================== TYPES ====================

interface MarkChannelReadInput {
  channelId: string;
  lastReadMessageId: string;
}

// ==================== MUTATIONS ====================

export function useMarkChannelReadMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, lastReadMessageId }: MarkChannelReadInput) =>
      withCurrentSession(() =>
        channelApi.markRead(workspaceId, channelId, lastReadMessageId)
      ),
    onSuccess: (_readState, { channelId }) => {
      void queryClient.invalidateQueries({
        queryKey: channelQueryKeys.list(workspaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: channelQueryKeys.detail(workspaceId, channelId),
        exact: true,
      });
    },
    networkMode: 'always',
    retry: false,
  });
}
