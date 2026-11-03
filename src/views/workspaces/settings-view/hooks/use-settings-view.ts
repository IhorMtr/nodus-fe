'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { createWorkspaceSchema } from '@/domains/workspace/model/create-workspace';
import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import {
  canManageWorkspace,
  useDeleteWorkspaceMutation,
  useRenameWorkspaceMutation,
  useWorkspaceQuery,
  workspaceQueryKeys,
  type Workspace,
} from '@/domains/workspace/model/workspace';
import { useRouter } from '@/shared/i18n/navigation';

// ==================== TYPES ====================

interface NameForm {
  name: string;
}

export function useSettingsView(workspaceId: string) {
  // ==================== CONTEXT AND QUERIES ====================

  const validation = useTranslations('workspace.validation');
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useCurrentUserQuery();
  const workspace = useWorkspaceQuery(workspaceId);

  // ==================== MUTATIONS ====================

  const rename = useRenameWorkspaceMutation(workspaceId);
  const remove = useDeleteWorkspaceMutation(workspaceId);

  // ==================== FORM AND STATE ====================

  const schema = useMemo(() => createWorkspaceSchema(validation), [validation]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NameForm>({
    resolver: yupResolver(schema),
    defaultValues: { name: '' },
  });
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  // ==================== PERMISSIONS ====================

  const canManage = canManageWorkspace(workspace.data?.role);
  const isOwner = workspace.data?.role === 'Owner';
  const workspaceName = workspace.data?.name;

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (workspaceName) {
      reset({ name: workspaceName });
    }
  }, [workspaceName, reset]);

  // ==================== NAME HANDLERS ====================

  const saveName = handleSubmit(async values => {
    if (!canManage) {
      return;
    }

    try {
      await rename.mutateAsync(values.name.trim());
    } catch {}
  });

  // ==================== DELETE HANDLERS ====================

  const openDelete = () => {
    remove.reset();
    setDeleteOpened(true);
  };

  const closeDelete = () => {
    if (remove.isPending || redirecting) {
      return;
    }

    setDeleteOpened(false);
    setConfirmation('');
    remove.reset();
  };

  const confirmDelete = async () => {
    if (!isOwner || !user.data || confirmation !== workspace.data?.name) {
      return;
    }

    try {
      await remove.mutateAsync();
      setRedirecting(true);

      const matchesWorkspace = (value: unknown) =>
        typeof value === 'string' &&
        value.toLowerCase() === workspaceId.toLowerCase();
      const scoped = (query: { queryKey: readonly unknown[] }) => {
        const key = query.queryKey;

        return (
          ((key[0] === 'channels' ||
            key[0] === 'messages' ||
            key[0] === 'invites') &&
            matchesWorkspace(key[1])) ||
          (key[0] === 'workspaces' &&
            (key[1] === 'detail' || key[1] === 'members') &&
            matchesWorkspace(key[2]))
        );
      };

      await queryClient.cancelQueries({ predicate: scoped });
      queryClient.removeQueries({ predicate: scoped });
      queryClient.setQueryData<Workspace[]>(workspaceQueryKeys.list, old =>
        old?.filter(item => !matchesWorkspace(item.id))
      );
      workspaceNavigation.clearLastWorkspaceId(user.data.id, workspaceId);

      await queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.list,
      });
      router.replace('/app');
    } catch {
      setRedirecting(false);
    }
  };

  // ==================== FEEDBACK ====================

  const retry = () => {
    if (workspace.isError) {
      void workspace.refetch();
    }
    if (user.isError) {
      void user.refetch();
    }
  };

  return {
    user,
    workspace,
    rename,
    remove,
    register,
    errors,
    deleteOpened,
    confirmation,
    setConfirmation,
    redirecting,
    canManage,
    isOwner,
    saveName,
    openDelete,
    closeDelete,
    confirmDelete,
    retry,
  };
}
