'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

import {
  authLifecycle,
  authSession,
  useAuthSession,
} from '@/domains/auth/model/session';
import { SocketContext } from '@/shared/realtime/socket-context';
import { logRealtime, realtimeDebug } from '@/shared/realtime/realtime-debug';

export function SocketProvider({ children }: { children: ReactNode }) {
  // ==================== SESSION STATE ====================

  const [socket, setSocket] = useState<Socket | null>(null);

  useAuthSession();

  const version = authSession.getVersion();
  const hasToken = Boolean(authSession.getAccessToken());

  // ==================== CONNECTION LIFECYCLE ====================

  useEffect(() => {
    const token = authSession.getAccessToken();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !backendUrl) {
      return;
    }

    const connection = io(backendUrl, {
      autoConnect: false,
      auth: { token },
    });
    logRealtime('[SOCKET] CREATED', { socketId: connection.id });
    let rejectedToken: string | null = null;
    let refreshAttempts = 0;
    let disposed = false;

    // ==================== AUTHENTICATION ====================

    const unsubscribe = authSession.subscribe(() => {
      if (version !== authSession.getVersion()) {
        connection.disconnect();
        return;
      }

      const current = authSession.getAccessToken();

      if (current) {
        const previous = (connection.auth as { token?: string }).token;
        connection.auth = { token: current };

        if (previous !== current && !connection.connected) {
          connection.connect();
        }
      }
    });

    // ==================== RECONNECTION ====================

    const onReconnectAttempt = () => {
      const current = authSession.getAccessToken();

      if (current) {
        connection.auth = { token: current };
      }
    };
    connection.io.on('reconnect_attempt', onReconnectAttempt);

    const onAny = (event: string, payload?: unknown) => {
      const metadata =
        payload && typeof payload === 'object'
          ? (payload as Record<string, unknown>)
          : {};
      const message =
        metadata.message && typeof metadata.message === 'object'
          ? (metadata.message as Record<string, unknown>)
          : {};

      logRealtime('[SOCKET] EVENT', {
        event,
        socketId: connection.id,
        workspaceId: metadata.workspaceId,
        channelId: metadata.channelId ?? message.channelId,
        messageId: metadata.messageId ?? message.id,
      });
    };

    if (realtimeDebug) {
      connection.onAny(onAny);
    }

    connection.on('connect', () => {
      logRealtime('[SOCKET] CONNECT', { socketId: connection.id });
      refreshAttempts = 0;
      rejectedToken = null;
    });

    connection.on('disconnect', reason => {
      logRealtime('[SOCKET] DISCONNECT', {
        socketId: connection.id,
        reason,
      });
    });

    connection.on('connect_error', error => {
      logRealtime('[SOCKET] CONNECT_ERROR', {
        socketId: connection.id,
        reason: error.message,
      });
      if (disposed || version !== authSession.getVersion()) {
        return;
      }

      if (error.message === 'AccessTokenExpired') {
        const usedToken = (connection.auth as { token?: string }).token;

        if (!usedToken || rejectedToken === usedToken || refreshAttempts >= 1) {
          return;
        }

        rejectedToken = usedToken;
        refreshAttempts++;

        void authLifecycle
          .refresh()
          .then(() => {
            if (disposed || version !== authSession.getVersion()) {
              return;
            }

            const fresh = authSession.getAccessToken();

            if (fresh && fresh !== usedToken) {
              connection.auth = { token: fresh };
              connection.connect();
            }
          })
          .catch(error => {
            console.error('Socket session refresh failed', error);
          });
      } else {
        console.warn('Socket connection failed', error);
      }
    });

    // ==================== CONNECTION START ====================

    connection.connect();

    queueMicrotask(() => {
      if (!disposed) {
        setSocket(connection);
      }
    });

    // ==================== CLEANUP ====================

    return () => {
      disposed = true;
      unsubscribe();

      connection.io.off('reconnect_attempt', onReconnectAttempt);
      connection.offAny(onAny);
      connection.removeAllListeners();
      connection.disconnect();
    };
  }, [version, hasToken]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
