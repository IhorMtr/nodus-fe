'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { authSessionEvents } from '@/domains/auth/model/session';
import { isPresenceUpdate } from '@/domains/presence/model/presence-status';
import {
  applyWorkspaceMemberPresence,
  refreshWorkspaceMembersPresence,
} from '@/domains/workspace/model/members';
import { logRealtime } from '@/shared/realtime/realtime-debug';
import { useAppSocket } from '@/shared/realtime/socket-context';

// ==================== PRESENCE SYNCHRONIZATION ====================

// Mounted once by the workspace shell, so each socket gets a single listener.
export function usePresenceRealtime() {
  // ==================== CONTEXT ====================

  const socket = useAppSocket();
  const queryClient = useQueryClient();

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (!socket) {
      return;
    }

    const version = authSessionEvents.getVersion();
    const valid = () => version === authSessionEvents.getVersion();

    // ==================== HANDLERS ====================

    const onUpdated = (payload: unknown) => {
      if (!valid() || !isPresenceUpdate(payload)) {
        return;
      }

      applyWorkspaceMemberPresence(queryClient, payload);

      logRealtime('[REALTIME] PRESENCE UPDATED', {
        socketId: socket.id,
        userId: payload.userId,
        status: payload.status,
      });
    };

    // Presence events missed while disconnected are never replayed.
    const onConnect = () => {
      if (!valid()) {
        return;
      }

      refreshWorkspaceMembersPresence(queryClient);
    };

    // ==================== LISTENERS ====================

    socket.on('presence:updated', onUpdated);
    socket.on('connect', onConnect);

    // ==================== CLEANUP ====================

    return () => {
      socket.off('presence:updated', onUpdated);
      socket.off('connect', onConnect);
    };
  }, [socket, queryClient]);
}
