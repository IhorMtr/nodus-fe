'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { authSessionEvents } from '@/domains/auth/model/session';
import {
  applyMessageRealtimeEvent,
  messageHistoryKey,
  type MessageRealtimeEvent,
  type Message,
} from '@/domains/message/model/message-history';
import { useAppSocket } from '@/shared/realtime/socket-context';
import { logRealtime } from '@/shared/realtime/realtime-debug';

// ==================== TYPES ====================

type JoinAck =
  | {
      success: true;
      data: { workspaceId: string; channelId: string };
      messageType: null;
      errors: null;
    }
  | {
      success: false;
      data: null;
      messageType:
        | 'ValidationFailed'
        | 'WorkspaceNotFound'
        | 'ChannelNotFound'
        | 'InternalError';
      errors: null;
    };

// ==================== CONSTANTS ====================

const JOIN_TIMEOUT_MS = 5000;

// Tracks active channel views on a shared transport. A late ACK from a previous
// mount must never leave a room already claimed by its replacement.
const subscriptions = new WeakMap<object, Map<string, number>>();

export function useChannelRealtime(workspaceId: string, channelId: string) {
  // ==================== STATE ====================

  const socket = useAppSocket();
  const queryClient = useQueryClient();

  const [canLoadHistory, setCanLoadHistory] = useState(false);
  const [joinEpoch, setJoinEpoch] = useState(0);
  const [joinError, setJoinError] = useState<string | null>(null);

  const pendingEvents = useRef<MessageRealtimeEvent[]>([]);
  const historyReleased = useRef(false);

  // ==================== SUBSCRIPTION LIFECYCLE ====================

  useEffect(() => {
    let active = true;
    let joined = false;
    let attempt = 0;
    let joining = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const version = authSessionEvents.getVersion();
    const subscription = { workspaceId, channelId };
    const subscriptionKey = `${workspaceId.toLowerCase()}:${channelId.toLowerCase()}`;
    const activeSubscriptions = socket
      ? (subscriptions.get(socket) ?? new Map<string, number>())
      : null;

    if (socket && activeSubscriptions) {
      subscriptions.set(socket, activeSubscriptions);
      activeSubscriptions.set(
        subscriptionKey,
        (activeSubscriptions.get(subscriptionKey) ?? 0) + 1
      );
    }

    const stillSubscribed = () =>
      Boolean(activeSubscriptions?.get(subscriptionKey));
    const valid = () => active && version === authSessionEvents.getVersion();

    // ==================== MESSAGE EVENTS ====================

    function handleEvent(event: MessageRealtimeEvent) {
      if (!valid() || !joined) {
        return;
      }

      if (event.workspaceId.toLowerCase() !== workspaceId.toLowerCase()) {
        return;
      }

      const eventChannelId =
        event.kind === 'deleted' ? event.channelId : event.message.channelId;

      if (eventChannelId.toLowerCase() !== channelId.toLowerCase()) {
        return;
      }

      const query = queryClient.getQueryState(
        messageHistoryKey(workspaceId, channelId)
      );

      if (!query?.data || query.fetchStatus === 'fetching') {
        pendingEvents.current.push(event);
      }

      applyMessageRealtimeEvent(queryClient, workspaceId, channelId, event);

      logRealtime(`[REALTIME] MESSAGE ${event.kind.toUpperCase()}`, {
        socketId: socket?.id,
        workspaceId,
        channelId,
        messageId:
          event.kind === 'deleted' ? event.messageId : event.message.id,
      });
    }

    // ==================== CHANNEL MEMBERSHIP ====================

    function join() {
      if (!socket || !socket.connected || !valid() || joining || joined) {
        return;
      }

      const current = ++attempt;
      const connectionId = socket.id;
      joining = true;
      joined = false;

      logRealtime('[CHANNEL] JOIN START', {
        socketId: connectionId,
        workspaceId,
        channelId,
      });

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        if (!valid() || current !== attempt) {
          return;
        }

        setJoinError('Timeout');
        joining = false;
        historyReleased.current = true;
        setCanLoadHistory(true);
      }, JOIN_TIMEOUT_MS);

      socket.emit('channel:join', subscription, (ack: JoinAck) => {
        logRealtime('[CHANNEL] JOIN ACK', {
          socketId: connectionId,
          workspaceId,
          channelId,
          success: ack?.success,
          messageType: ack?.messageType,
        });

        if (!valid()) {
          if (
            ack?.success &&
            socket.connected &&
            socket.id === connectionId &&
            !stillSubscribed()
          ) {
            socket.emit('channel:leave', subscription);
            logRealtime('[CHANNEL] LEAVE', {
              socketId: socket.id,
              workspaceId,
              channelId,
              reason: 'late acknowledgement',
            });
          }

          return;
        }

        if (current !== attempt) {
          return;
        }

        clearTimeout(timeout);
        joining = false;

        if (ack?.success) {
          const workspaceMatches =
            ack.data.workspaceId.toLowerCase() === workspaceId.toLowerCase();
          const channelMatches =
            ack.data.channelId.toLowerCase() === channelId.toLowerCase();

          if (workspaceMatches && channelMatches) {
            joined = true;
            setJoinError(null);
            setCanLoadHistory(true);

            setJoinEpoch(value => value + (historyReleased.current ? 2 : 1));
            historyReleased.current = false;
            return;
          }

          socket.emit('channel:leave', subscription);
          logRealtime('[CHANNEL] LEAVE', {
            socketId: socket.id,
            workspaceId,
            channelId,
            reason: 'invalid acknowledgement',
          });
        }

        setJoinError(
          ack?.success
            ? 'InvalidAcknowledgement'
            : (ack?.messageType ?? 'InternalError')
        );
        historyReleased.current = true;
        setCanLoadHistory(true);
      });
    }

    function disconnect() {
      joined = false;
      joining = false;
      ++attempt;

      clearTimeout(timeout);
      setJoinError('Disconnected');
    }

    function connectionError(error: Error) {
      if (!valid()) {
        return;
      }

      setJoinError(error.message || 'ConnectionError');
      historyReleased.current = true;
      setCanLoadHistory(true);
    }

    // ==================== REST FALLBACK ====================

    const unavailableTimeout = setTimeout(() => {
      if (valid() && !joined) {
        setJoinError('ConnectionTimeout');
        historyReleased.current = true;
        setCanLoadHistory(true);
      }
    }, JOIN_TIMEOUT_MS);

    // ==================== LISTENERS ====================

    socket?.on('connect', join);
    socket?.on('disconnect', disconnect);
    socket?.on('connect_error', connectionError);

    const created = (payload: { workspaceId: string; message: Message }) =>
      handleEvent({ kind: 'created', ...payload });
    const updated = (payload: { workspaceId: string; message: Message }) =>
      handleEvent({ kind: 'updated', ...payload });
    const deleted = (payload: {
      workspaceId: string;
      channelId: string;
      messageId: string;
    }) => handleEvent({ kind: 'deleted', ...payload });

    socket?.on('message:created', created);
    socket?.on('message:updated', updated);
    socket?.on('message:deleted', deleted);

    join();

    // ==================== CLEANUP ====================

    return () => {
      active = false;
      ++attempt;

      if (activeSubscriptions) {
        const remaining = (activeSubscriptions.get(subscriptionKey) ?? 1) - 1;

        if (remaining > 0) {
          activeSubscriptions.set(subscriptionKey, remaining);
        } else {
          activeSubscriptions.delete(subscriptionKey);
        }
      }

      clearTimeout(timeout);
      clearTimeout(unavailableTimeout);

      if ((joined || joining) && socket?.connected && !stillSubscribed()) {
        socket.emit('channel:leave', subscription);
        logRealtime('[CHANNEL] LEAVE', {
          socketId: socket.id,
          workspaceId,
          channelId,
          reason: 'subscription cleanup',
        });
      }

      socket?.off('connect', join);
      socket?.off('disconnect', disconnect);
      socket?.off('connect_error', connectionError);
      socket?.off('message:created', created);
      socket?.off('message:updated', updated);
      socket?.off('message:deleted', deleted);
    };
  }, [socket, workspaceId, channelId, queryClient]);

  return {
    canLoadHistory,
    joinEpoch,
    joinError,
    pendingEvents,
  };
}
