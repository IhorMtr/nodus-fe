'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useSelectedLayoutSegments } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import {
  channelNameSchema,
  getChannelErrorKey,
  useChannelsQuery,
  useCreateChannelMutation,
  useDeleteChannelMutation,
  useRenameChannelMutation,
  type Channel,
} from '@/domains/channel/model/channel';
import { messageHistoryKey } from '@/domains/message/model/message-history';
import type { User } from '@/domains/user/model/current-user';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';
import { useRouter } from '@/shared/i18n/navigation';

// ==================== CHANNEL MANAGEMENT ====================

export function useWorkspaceSidebar(
  workspaceId: string,
  user: User,
  onNavigate?: () => void
) {
  // ==================== CONTEXT ====================

  const channel = useTranslations('channel');
  const validation = useTranslations('channel.validation');
  const segments = useSelectedLayoutSegments();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [section, selectedChannelId] = segments;
  const channelId = section === 'channels' ? selectedChannelId : undefined;

  // ==================== QUERIES AND MUTATIONS ====================

  const channels = useChannelsQuery(workspaceId);
  const workspace = useWorkspaceQuery(workspaceId);
  const createChannel = useCreateChannelMutation(workspaceId);
  const renameChannel = useRenameChannelMutation(workspaceId);
  const deleteChannel = useDeleteChannelMutation(workspaceId);

  // ==================== FORM AND STATE ====================

  const [editor, setEditor] = useState<'create' | 'rename' | null>(null);
  const [selected, setSelected] = useState<Channel | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const schema = useMemo(() => channelNameSchema(validation), [validation]);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<{ name: string }>({
    resolver: yupResolver(schema),
    defaultValues: { name: '' },
  });

  // ==================== PERMISSIONS AND FEEDBACK ====================

  const canManage =
    workspace.data?.role === 'Owner' || workspace.data?.role === 'Admin';
  const status = isAxiosError(channels.error)
    ? channels.error.response?.status
    : undefined;

  // ==================== EDITOR HANDLERS ====================

  function openEditor(mode: 'create' | 'rename', item: Channel | null = null) {
    setSelected(item);
    reset({ name: item?.name ?? '' });
    clearErrors();
    setEditor(mode);
  }

  function closeEditor() {
    if (createChannel.isPending || renameChannel.isPending) {
      return;
    }

    setEditor(null);
    setSelected(null);
  }

  async function saveChannel({ name }: { name: string }) {
    if (!canManage || createChannel.isPending || renameChannel.isPending) {
      return;
    }

    const trimmedName = name.trim();
    const duplicate = channels.data?.some(
      item =>
        item.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        item.id !== selected?.id
    );
    if (duplicate) {
      setError('name', { message: channel('errors.duplicateName') });
      return;
    }

    try {
      if (editor === 'create') {
        const created = await createChannel.mutateAsync(trimmedName);
        workspaceNavigation.setLastChannelId(user.id, workspaceId, created.id);
        setEditor(null);
        onNavigate?.();
        router.push({
          pathname: '/workspaces/[workspaceId]/channels/[channelId]',
          params: { workspaceId, channelId: created.id },
        });
      } else if (editor === 'rename' && selected) {
        await renameChannel.mutateAsync({
          channelId: selected.id,
          name: trimmedName,
        });
        setEditor(null);
        setSelected(null);
      }
    } catch (error) {
      const key = getChannelErrorKey(error);
      setError(
        key === 'duplicateName' || key === 'validationFailed'
          ? 'name'
          : 'root.server',
        {
          message: channel(`errors.${key}`),
        }
      );
    }
  }

  function submitEditor(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(saveChannel)(event);
  }

  // ==================== CHANNEL REMOVAL ====================

  async function confirmDelete() {
    if (!canManage || !selected || deleteChannel.isPending) {
      return;
    }

    try {
      const deletedId = selected.id;
      await deleteChannel.mutateAsync(deletedId);
      await queryClient.cancelQueries({
        queryKey: messageHistoryKey(workspaceId, deletedId),
      });
      queryClient.removeQueries({
        queryKey: messageHistoryKey(workspaceId, deletedId),
      });
      workspaceNavigation.clearLastChannelId(user.id, workspaceId, deletedId);
      const next = channels.data?.find(item => item.id !== deletedId);
      setSelected(null);
      setDeleteError(null);

      if (channelId === deletedId) {
        onNavigate?.();
        router.replace(
          next
            ? {
                pathname: '/workspaces/[workspaceId]/channels/[channelId]',
                params: { workspaceId, channelId: next.id },
              }
            : {
                pathname: '/workspaces/[workspaceId]',
                params: { workspaceId },
              }
        );
      }
    } catch (error) {
      setDeleteError(channel(`errors.${getChannelErrorKey(error)}`));
    }
  }

  // ==================== DELETE DIALOG HANDLERS ====================

  function requestDelete(item: Channel) {
    setSelected(item);
    setDeleteError(null);
  }

  function closeDelete() {
    if (!deleteChannel.isPending) {
      setSelected(null);
    }
  }

  return {
    section,
    channelId,
    channels,
    canManage,
    createChannel,
    renameChannel,
    deleteChannel,
    editor,
    selected,
    deleteError,
    register,
    errors,
    status,
    openEditor,
    closeEditor,
    submitEditor,
    confirmDelete,
    requestDelete,
    closeDelete,
  };
}
