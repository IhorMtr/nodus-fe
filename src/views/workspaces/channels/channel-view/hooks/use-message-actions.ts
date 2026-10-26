'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useDeleteMessageMutation } from '@/domains/message/model/delete-message';
import { useUpdateMessageMutation } from '@/domains/message/model/edit-message';
import {
  getMessageErrorKey,
  isMessageNotFound,
} from '@/domains/message/model/message-errors';
import type { Message } from '@/domains/message/model/message-history';
import { useCreateMessageMutation } from '@/domains/message/model/send-message';

export function useMessageActions(workspaceId: string, channelId: string) {
  const errors = useTranslations('message.errors');
  const create = useCreateMessageMutation();
  const update = useUpdateMessageMutation();
  const remove = useDeleteMessageMutation();
  const [lastSentId, setLastSentId] = useState<string>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);

  const errorText = (error: unknown) =>
    error ? errors(getMessageErrorKey(error)) : undefined;

  // ==================== SEND ====================

  const send = async (content: string) => {
    create.reset();
    const message = await create.mutateAsync({
      workspaceId,
      channelId,
      content,
    });
    setLastSentId(message.id);
  };

  // ==================== EDIT ====================

  const startEdit = (messageId: string) => {
    update.reset();
    setEditingId(messageId);
  };

  const cancelEdit = () => {
    update.reset();
    setEditingId(null);
  };

  const saveEdit = async (content: string) => {
    if (!editingId) return;
    await update.mutateAsync({
      workspaceId,
      channelId,
      messageId: editingId,
      content,
    });
    setEditingId(null);
  };

  // ==================== DELETE ====================

  const requestDelete = (message: Message) => {
    remove.reset();
    setDeleteTarget(message);
  };

  const closeDelete = () => {
    if (!remove.isPending) setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await remove.mutateAsync({
        workspaceId,
        channelId,
        messageId: deleteTarget.id,
      });
      setDeleteTarget(null);
    } catch (error) {
      // The message is already gone, so there is nothing left to confirm.
      if (isMessageNotFound(error)) setDeleteTarget(null);
    }
  };

  return {
    lastSentId,
    composer: {
      onSubmit: send,
      isSubmitting: create.isPending,
      error: errorText(create.error),
    },
    editing: {
      editingId,
      isSaving: update.isPending,
      error: errorText(update.error),
      onEdit: startEdit,
      onSave: saveEdit,
      onCancel: cancelEdit,
    },
    deletion: {
      isOpen: deleteTarget !== null,
      isDeleting: remove.isPending,
      error: errorText(remove.error),
      onRequest: requestDelete,
      onConfirm: () => void confirmDelete(),
      onClose: closeDelete,
    },
  };
}
