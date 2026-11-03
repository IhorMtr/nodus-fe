'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { authSessionEvents } from '@/domains/auth/model/session';
import {
  applyDirectMessage,
  applyDirectRead,
  conversationKeys,
  invalidateConversationList,
  type DirectMessage,
} from '@/domains/conversation/model/conversations';
import { useAppSocket } from '@/shared/realtime/socket-context';

// ==================== TYPES AND SUBSCRIPTIONS ====================

type JoinAck =
  | { success: true; data: { workspaceId: string; conversationId: string } }
  | { success: false; messageType?: string };
type DirectEvent =
  | { kind: 'created' | 'updated'; message: DirectMessage }
  | { kind: 'deleted'; messageId: string };
type DirectReadEvent = {
  workspaceId: string;
  conversationId: string;
  readerId: string;
  lastReadMessageId: string;
  lastReadCreatedAt: string;
  lastReadAt: string;
};
const subscriptions = new WeakMap<object, Map<string, number>>();

// ==================== READ ORDERING ====================

function isStaleReadEvent(
  previous: DirectReadEvent,
  incoming: DirectReadEvent
) {
  const previousTime = Date.parse(previous.lastReadCreatedAt);
  const incomingTime = Date.parse(incoming.lastReadCreatedAt);

  return (
    previousTime > incomingTime ||
    (previousTime === incomingTime &&
      previous.lastReadMessageId.localeCompare(incoming.lastReadMessageId) >= 0)
  );
}

export function useDirectRealtime(workspaceId: string, conversationId: string) {
  // ==================== STATE AND REFS ====================

  const socket = useAppSocket();
  const client = useQueryClient();
  const [canLoadHistory, setCanLoadHistory] = useState(false);
  const [joinEpoch, setJoinEpoch] = useState(0);
  const [error, setError] = useState<string>();
  const [retryToken, setRetryToken] = useState(0);
  const pending = useRef<DirectEvent[]>([]);
  const pendingReads = useRef<DirectReadEvent[]>([]);

  // ==================== ROOM LIFECYCLE ====================

  useEffect(() => {
    let active = true;
    let inRoom = false;
    let joining = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const latestReads = new Map<string, DirectReadEvent>();
    const version = authSessionEvents.getVersion();
    const room = { workspaceId, conversationId };
    const key = `${workspaceId.toLowerCase()}:${conversationId.toLowerCase()}`;
    const claims = socket
      ? (subscriptions.get(socket) ?? new Map<string, number>())
      : null;
    if (socket && claims) {
      subscriptions.set(socket, claims);
      claims.set(key, (claims.get(key) ?? 0) + 1);
    }
    const valid = () => active && version === authSessionEvents.getVersion();
    const stillClaimed = () => Boolean(claims?.get(key));

    // ==================== EVENT RECONCILIATION ====================

    function receive(event: DirectEvent) {
      if (!valid() || !inRoom) {
        return;
      }
      const query = client.getQueryState(
        conversationKeys.history(workspaceId, conversationId)
      );
      if (!query?.data || query.fetchStatus === 'fetching') {
        pending.current.push(event);
      }
      applyDirectMessage(
        client,
        workspaceId,
        conversationId,
        event.kind,
        event.kind === 'deleted' ? event.messageId : event.message
      );

      if (event.kind !== 'deleted') {
        for (const read of latestReads.values()) {
          applyDirectRead(
            client,
            workspaceId,
            conversationId,
            read.readerId,
            read.lastReadCreatedAt,
            read.lastReadMessageId
          );
        }
      }

      invalidateConversationList(client, workspaceId);
    }
    const created = (payload: {
      workspaceId: string;
      message: DirectMessage;
    }) => {
      if (
        payload.workspaceId.toLowerCase() === workspaceId.toLowerCase() &&
        payload.message.conversationId.toLowerCase() ===
          conversationId.toLowerCase()
      ) {
        receive({ kind: 'created', message: payload.message });
      }
    };
    const updated = (payload: {
      workspaceId: string;
      message: DirectMessage;
    }) => {
      if (
        payload.workspaceId.toLowerCase() === workspaceId.toLowerCase() &&
        payload.message.conversationId.toLowerCase() ===
          conversationId.toLowerCase()
      ) {
        receive({ kind: 'updated', message: payload.message });
      }
    };
    const deleted = (payload: {
      workspaceId: string;
      conversationId: string;
      messageId: string;
    }) => {
      if (
        payload.workspaceId.toLowerCase() === workspaceId.toLowerCase() &&
        payload.conversationId.toLowerCase() === conversationId.toLowerCase()
      ) {
        receive({ kind: 'deleted', messageId: payload.messageId });
      }
    };

    const onRead = (event: DirectReadEvent) => {
      if (
        !valid() ||
        event.workspaceId.toLowerCase() !== workspaceId.toLowerCase() ||
        event.conversationId.toLowerCase() !== conversationId.toLowerCase()
      ) {
        return;
      }

      const previous = latestReads.get(event.readerId);

      if (previous && isStaleReadEvent(previous, event)) {
        return;
      }

      latestReads.set(event.readerId, event);

      const query = client.getQueryState(
        conversationKeys.history(workspaceId, conversationId)
      );

      if (!query?.data || query.fetchStatus === 'fetching') {
        pendingReads.current.push(event);
      }

      applyDirectRead(
        client,
        workspaceId,
        conversationId,
        event.readerId,
        event.lastReadCreatedAt,
        event.lastReadMessageId
      );

      invalidateConversationList(client, workspaceId);
    };

    // ==================== JOIN AND RECONNECT ====================

    function join() {
      if (!socket?.connected || !valid() || joining || inRoom) {
        return;
      }
      const current = ++attempt;
      const connectionId = socket.id;
      joining = true;
      setError(undefined);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (valid() && current === attempt) {
          joining = false;
          setError('Timeout');
        }
      }, 5000);
      socket.emit('conversation:join', room, (ack: JoinAck) => {
        if (!valid()) {
          if (
            ack?.success &&
            socket.connected &&
            socket.id === connectionId &&
            !stillClaimed()
          ) {
            socket.emit('conversation:leave', room);
          }
          return;
        }
        if (current !== attempt || socket.id !== connectionId) {
          return;
        }
        clearTimeout(timer);
        joining = false;
        if (
          ack?.success &&
          ack.data?.workspaceId?.toLowerCase() === workspaceId.toLowerCase() &&
          ack.data?.conversationId?.toLowerCase() ===
            conversationId.toLowerCase()
        ) {
          inRoom = true;
          setCanLoadHistory(true);
          setJoinEpoch(value => value + 1);
          setError(undefined);
          invalidateConversationList(client, workspaceId);
        } else {
          if (ack?.success && (claims?.get(key) ?? 0) <= 1) {
            socket.emit('conversation:leave', room);
          }
          setError(
            ack?.success
              ? 'InvalidAcknowledgement'
              : (ack?.messageType ?? 'JoinFailed')
          );
        }
      });
    }
    function disconnect() {
      inRoom = false;
      joining = false;
      ++attempt;
      clearTimeout(timer);
      setError('Disconnected');
    }

    socket?.on('connect', join);
    socket?.on('disconnect', disconnect);
    socket?.on('direct-message:created', created);
    socket?.on('direct-message:updated', updated);
    socket?.on('direct-message:deleted', deleted);
    socket?.on('direct-message:read', onRead);
    join();
    const unavailableTimer = setTimeout(() => {
      if (valid() && !inRoom) {
        setError(current => current ?? 'ConnectionTimeout');
      }
    }, 5000);

    // ==================== CLEANUP ====================

    return () => {
      active = false;
      ++attempt;
      clearTimeout(timer);
      clearTimeout(unavailableTimer);
      if (claims) {
        const remaining = (claims.get(key) ?? 1) - 1;
        if (remaining > 0) {
          claims.set(key, remaining);
        } else {
          claims.delete(key);
        }
      }
      if ((inRoom || joining) && socket?.connected && !stillClaimed()) {
        socket.emit('conversation:leave', room);
      }
      socket?.off('connect', join);
      socket?.off('disconnect', disconnect);
      socket?.off('direct-message:created', created);
      socket?.off('direct-message:updated', updated);
      socket?.off('direct-message:deleted', deleted);
      socket?.off('direct-message:read', onRead);
    };
  }, [socket, client, workspaceId, conversationId, retryToken]);

  return {
    canLoadHistory,
    joinEpoch,
    error,
    pending,
    pendingReads,
    retry: () => setRetryToken(value => value + 1),
  };
}
