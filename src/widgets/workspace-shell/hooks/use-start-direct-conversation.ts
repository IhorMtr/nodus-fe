'use client';

import { useRef } from 'react';
import { useOpenConversationMutation } from '@/domains/conversation/model/conversations';
import type { WorkspaceMember } from '@/domains/workspace/model/members';
import { useRouter } from '@/shared/i18n/navigation';

// ==================== MEMBER ACTION ====================

export function useStartDirectConversation(
  workspaceId: string,
  currentUserId: string,
  members: WorkspaceMember[]
) {
  const router = useRouter();
  const open = useOpenConversationMutation(workspaceId);
  const lock = useRef(false);

  const start = async (member: WorkspaceMember) => {
    if (
      lock.current ||
      member.userId === currentUserId ||
      !members.some(item => item.userId === member.userId)
    ) {
      return;
    }
    lock.current = true;
    try {
      const conversation = await open.mutateAsync(member.userId);
      router.push({
        pathname: '/workspaces/[workspaceId]/conversations/[conversationId]',
        params: { workspaceId, conversationId: conversation.id },
      });
    } catch {
    } finally {
      lock.current = false;
    }
  };

  return { start, isPending: open.isPending, error: open.isError };
}
