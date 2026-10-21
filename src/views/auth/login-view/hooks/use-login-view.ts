'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  createLoginSchema,
  useLoginMutation,
  type LoginRequest,
} from '@/domains/auth/model/login';
import { getAuthErrorFeedback } from '@/domains/auth/model/errors';
import type { LoginFormProps } from '@/domains/auth/ui/login-form';
import { useRouter } from '@/shared/i18n/navigation';

export function useLoginView(): LoginFormProps {
  const validation = useTranslations('auth.validation');
  const messages = useTranslations('auth.messages');
  const router = useRouter();
  const mutation = useLoginMutation();
  const submissionLock = useRef(false);

  // ==================== FORM STATE ====================

  const schema = useMemo(() => createLoginSchema(validation), [validation]);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  // ==================== SUBMISSION ====================

  const onSubmit: LoginFormProps['onSubmit'] = async event => {
    event.preventDefault();
    if (submissionLock.current) return;
    submissionLock.current = true;

    try {
      await handleSubmit(async values => {
        clearErrors();

        try {
          await mutation.mutateAsync(values);
          router.replace('/app');
        } catch (error) {
          const feedback = getAuthErrorFeedback(error, messages);
          for (const field of ['email', 'password'] as const) {
            const message = feedback.fieldErrors[field];
            if (message) setError(field, { type: 'server', message });
          }
          setError('root.server', { message: feedback.formError });
        } finally {
          mutation.reset();
        }
      })(event);
    } finally {
      submissionLock.current = false;
    }
  };

  // ==================== FORM PROPS ====================

  return {
    fields: {
      email: { ...register('email'), error: errors.email?.message },
      password: { ...register('password'), error: errors.password?.message },
    },
    onSubmit,
    isSubmitting: isSubmitting || mutation.isPending,
    formError: errors.root?.server?.message,
  };
}
