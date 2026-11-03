'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  applyDirectMessage,
  useDirectMessageMutations,
  type DirectMessage,
} from '@/domains/conversation/model/conversations';
import {
  getMessageErrorKey,
  isMessageNotFound,
} from '@/domains/message/model/message-errors';

// ==================== MESSAGE ACTIONS ====================

export function useDirectMessageActions(
  workspaceId: string,
  conversationId: string
) {
  const errors = useTranslations('message.errors');
  const conversation = useTranslations('conversation');
  const client = useQueryClient();
  const mutations = useDirectMessageMutations(workspaceId, conversationId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DirectMessage | null>(null);
  const [lastSentId, setLastSentId] = useState<string>();

  // ==================== SEND AND EDIT ====================

  const errorText = (error: unknown) => {
    if (!error) {
      return undefined;
    }
    const key = getMessageErrorKey(error);
    return key === 'notFound' ? conversation('unavailable') : errors(key);
  };

  const send = async (content: string) => {
    mutations.send.reset();
    const message = await mutations.send.mutateAsync(content);
    setLastSentId(message.id);
  };

  const saveEdit = async (content: string) => {
    if (!editingId) {
      return;
    }
    await mutations.update.mutateAsync({ messageId: editingId, content });
    setEditingId(null);
  };

  // ==================== DELETE ====================

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await mutations.remove.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      if (isMessageNotFound(error)) {
        applyDirectMessage(
          client,
          workspaceId,
          conversationId,
          'deleted',
          deleteTarget.id
        );
        setDeleteTarget(null);
      }
    }
  };

  return {
    lastSentId,
    composer: {
      onSubmit: send,
      isSubmitting: mutations.send.isPending,
      error: errorText(mutations.send.error),
    },
    editing: {
      editingId,
      isSaving: mutations.update.isPending,
      error: errorText(mutations.update.error),
      onEdit: (id: string) => {
        mutations.update.reset();
        setEditingId(id);
      },
      onSave: saveEdit,
      onCancel: () => {
        mutations.update.reset();
        setEditingId(null);
      },
    },
    deletion: {
      isOpen: Boolean(deleteTarget),
      isDeleting: mutations.remove.isPending,
      error: errorText(mutations.remove.error),
      onRequest: (message: DirectMessage) => {
        mutations.remove.reset();
        setDeleteTarget(message);
      },
      onConfirm: () => void confirmDelete(),
      onClose: () => {
        if (!mutations.remove.isPending) {
          setDeleteTarget(null);
        }
      },
    },
  };
}
