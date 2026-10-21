'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { isAxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import {
  createWorkspaceSchema,
  getCreateWorkspaceErrorFeedback,
  useCreateWorkspaceMutation,
  type CreateWorkspaceRequest,
} from '@/domains/workspace/model/create-workspace';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import type { CreateWorkspaceFormProps } from '@/domains/workspace/ui/create-workspace-form';
import { useRouter } from '@/shared/i18n/navigation';

export function useNewWorkspaceView() {
  const t = useTranslations('workspace');
  const validation = useTranslations('workspace.validation');
  const messages = useTranslations('workspace.errors');
  const authMessages = useTranslations('auth.messages');
  const router = useRouter();
  const currentUser = useCurrentUserQuery();
  const mutation = useCreateWorkspaceMutation();
  const submissionLock = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ==================== FORM STATE ====================

  const schema = useMemo(() => createWorkspaceSchema(validation), [validation]);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceRequest>({
    resolver: yupResolver(schema),
    defaultValues: { name: '' },
  });

  // ==================== SUBMISSION ====================

  const onSubmit: CreateWorkspaceFormProps['onSubmit'] = async event => {
    event.preventDefault();
    if (submissionLock.current || !currentUser.data) return;
    submissionLock.current = true;
    const userId = currentUser.data.id;
    let created = false;

    try {
      await handleSubmit(async values => {
        clearErrors();

        try {
          const workspace = await mutation.mutateAsync(values);
          created = true;
          setIsRedirecting(true);
          workspaceNavigation.setLastWorkspaceId(userId, workspace.id);
          router.replace({
            pathname: '/workspaces/[workspaceId]',
            params: { workspaceId: workspace.id },
          });
        } catch (error) {
          const feedback = getCreateWorkspaceErrorFeedback(error, messages);
          if (feedback.fieldErrors.name) {
            setError('name', {
              type: 'server',
              message: feedback.fieldErrors.name,
            });
          }
          setError('root.server', { message: feedback.formError });
          mutation.reset();
        }
      })(event);
    } finally {
      // Keep the successful submission locked until navigation unmounts the form.
      if (!created) submissionLock.current = false;
    }
  };

  // ==================== VIEW STATE ====================

  const status = isAxiosError(currentUser.error)
    ? currentUser.error.response?.status
    : undefined;
  const loadError = currentUser.isError
    ? status === 401
      ? authMessages('sessionExpired')
      : status === 403
        ? messages('accessDenied')
        : t('states.currentUserFailed')
    : undefined;

  const form: CreateWorkspaceFormProps = {
    nameField: { ...register('name'), error: errors.name?.message },
    onSubmit,
    isSubmitting: isSubmitting || mutation.isPending || isRedirecting,
    formError: errors.root?.server?.message,
  };

  return {
    form,
    isLoading:
      currentUser.isPending ||
      !currentUser.isFetchedAfterMount ||
      (currentUser.isError && currentUser.isFetching),
    loadError,
    retry: () => {
      void currentUser.refetch();
    },
  };
}
