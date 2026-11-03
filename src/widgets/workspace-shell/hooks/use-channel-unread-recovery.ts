'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { authSessionEvents } from '@/domains/auth/model/session';
import { channelQueryKeys } from '@/domains/channel/model/channel';
import { useAppSocket } from '@/shared/realtime/socket-context';

// ==================== UNREAD RECOVERY ====================

export function useChannelUnreadRecovery(workspaceId: string) {
  // ==================== CONTEXT ====================

  const socket = useAppSocket();
  const queryClient = useQueryClient();

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (!socket) {
      return;
    }

    const version = authSessionEvents.getVersion();
    let disconnected = false;

    // ==================== HANDLERS ====================

    const onDisconnect = () => {
      disconnected = true;
    };

    const onConnect = () => {
      if (!disconnected || version !== authSessionEvents.getVersion()) {
        return;
      }

      disconnected = false;

      void queryClient.invalidateQueries({
        queryKey: channelQueryKeys.list(workspaceId),
      });
    };

    // ==================== LISTENERS ====================

    socket.on('disconnect', onDisconnect);
    socket.on('connect', onConnect);

    // ==================== CLEANUP ====================

    return () => {
      socket.off('disconnect', onDisconnect);
      socket.off('connect', onConnect);
    };
  }, [socket, queryClient, workspaceId]);
}
