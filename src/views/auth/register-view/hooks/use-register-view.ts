'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  createRegisterSchema,
  useRegisterMutation,
  type RegisterRequest,
} from '@/domains/auth/model/register';
import { getAuthErrorFeedback } from '@/domains/auth/model/errors';
import type { RegisterFormProps } from '@/domains/auth/ui/register-form';
import { useRouter } from '@/shared/i18n/navigation';

export function useRegisterView(): RegisterFormProps {
  const validation = useTranslations('auth.validation');
  const messages = useTranslations('auth.messages');
  const router = useRouter();
  const mutation = useRegisterMutation();
  const submissionLock = useRef(false);

  // ==================== FORM STATE ====================

  const schema = useMemo(() => createRegisterSchema(validation), [validation]);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // ==================== SUBMISSION ====================

  const onSubmit: RegisterFormProps['onSubmit'] = async event => {
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
          const fields = [
            'firstName',
            'lastName',
            'email',
            'password',
            'confirmPassword',
          ] as const;
          for (const field of fields) {
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
      firstName: { ...register('firstName'), error: errors.firstName?.message },
      lastName: { ...register('lastName'), error: errors.lastName?.message },
      email: { ...register('email'), error: errors.email?.message },
      password: { ...register('password'), error: errors.password?.message },
      confirmPassword: {
        ...register('confirmPassword'),
        error: errors.confirmPassword?.message,
      },
    },
    onSubmit,
    isSubmitting: isSubmitting || mutation.isPending,
    formError: errors.root?.server?.message,
  };
}
