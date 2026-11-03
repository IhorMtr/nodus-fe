'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import {
  conversationKeys,
  useConversationsQuery,
  useOpenConversationMutation,
} from '@/domains/conversation/model/conversations';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { useWorkspaceMembersQuery } from '@/domains/workspace/model/members';
import { getHttpStatus } from '@/shared/api/http-error';
import { useRouter } from '@/shared/i18n/navigation';
import { useAppSocket } from '@/shared/realtime/socket-context';

// ==================== PAGE STATE ====================

export function useConversationsView(
  workspaceId: string,
  conversationId?: string
) {
  const router = useRouter();
  const client = useQueryClient();
  const socket = useAppSocket();
  const user = useCurrentUserQuery();
  const members = useWorkspaceMembersQuery(workspaceId);
  const list = useConversationsQuery(workspaceId, Boolean(user.data));
  const open = useOpenConversationMutation(workspaceId);
  const openingRef = useRef(false);

  // ==================== DERIVED STATE ====================

  const conversations = useMemo(() => {
    const withCurrentPresence = (list.data ?? []).map(conversation => {
      const member = members.data?.find(
        member => member.userId === conversation.otherUser.id
      );

      if (!member?.status) {
        return conversation;
      }

      return {
        ...conversation,
        otherUser: { ...conversation.otherUser, status: member.status },
      };
    });

    return withCurrentPresence.sort((first, second) => {
      const firstActivity = first.lastMessage?.createdAt ?? first.updatedAt;
      const secondActivity = second.lastMessage?.createdAt ?? second.updatedAt;

      return Date.parse(secondActivity) - Date.parse(firstActivity);
    });
  }, [list.data, members.data]);
  const selected = conversations.find(item => item.id === conversationId);
  const availableMembers = user.data
    ? (members.data?.filter(member => member.userId !== user.data.id) ?? [])
    : [];

  // ==================== HANDLERS ====================

  const navigate = (selectedConversationId: string) =>
    router.push({
      pathname: '/workspaces/[workspaceId]/conversations/[conversationId]',
      params: { workspaceId, conversationId: selectedConversationId },
    });
  const close = () =>
    router.push({
      pathname: '/workspaces/[workspaceId]/conversations',
      params: { workspaceId },
    });
  const start = async (userId: string) => {
    if (
      !user.data ||
      openingRef.current ||
      userId === user.data?.id ||
      !availableMembers.some(member => member.userId === userId)
    ) {
      return;
    }
    openingRef.current = true;
    try {
      const conversation = await open.mutateAsync(userId);
      navigate(conversation.id);
    } finally {
      openingRef.current = false;
    }
  };

  // ==================== LIST RECOVERY ====================

  useEffect(() => {
    const refresh = () => {
      void client.invalidateQueries({
        queryKey: conversationKeys.list(workspaceId),
      });
    };
    const visible = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };
    socket?.on('connect', refresh);
    window.addEventListener('focus', visible);
    document.addEventListener('visibilitychange', visible);
    return () => {
      socket?.off('connect', refresh);
      window.removeEventListener('focus', visible);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [socket, client, workspaceId]);

  // ==================== ACCESS LOSS ====================

  useEffect(() => {
    if (getHttpStatus(list.error) !== 403) {
      return;
    }

    void client.cancelQueries({ queryKey: conversationKeys.all(workspaceId) });
    client.removeQueries({ queryKey: conversationKeys.all(workspaceId) });
    router.replace('/app');
  }, [list.error, client, workspaceId, router]);

  return {
    user,
    members,
    list,
    conversations,
    selected,
    availableMembers,
    open,
    start,
    navigate,
    close,
  };
}
