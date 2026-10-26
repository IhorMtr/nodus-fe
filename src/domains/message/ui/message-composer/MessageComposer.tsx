'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';

import { Textarea } from '@/shared/ui/textarea';

import {
  messageContentSchema,
  type MessageContentForm,
} from '../../model/message-content';

import styles from './MessageComposer.module.scss';

// ==================== TYPES ====================

type MessageComposerProps = {
  // Rejects when sending fails, which keeps the draft in the field.
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
};

// ==================== COMPONENT ====================

export function MessageComposer({
  onSubmit,
  isSubmitting,
  error,
}: MessageComposerProps) {
  const t = useTranslations('message');
  const validation = useTranslations('message.validation');
  const submissionLock = useRef(false);
  const schema = useMemo(() => messageContentSchema(validation), [validation]);
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<MessageContentForm>({
    resolver: yupResolver(schema),
    defaultValues: { content: '' },
  });

  // ==================== HANDLERS ====================

  async function send({ content }: MessageContentForm) {
    if (submissionLock.current) return;
    submissionLock.current = true;

    try {
      await onSubmit(content);
      reset();
      setFocus('content');
    } catch {
      // The failure is reported through the error prop and the draft is kept.
    } finally {
      submissionLock.current = false;
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(send)(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return;
    // Enter confirms an IME candidate and must not send the message.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;

    event.preventDefault();
    // Blank drafts are ignored silently instead of showing a validation error.
    if (event.currentTarget.value.trim() === '' || isSubmitting) return;
    event.currentTarget.form?.requestSubmit();
  }

  // ==================== RENDER ====================

  const message = errors.content?.message ?? error;

  return (
    <form
      className={styles.composer}
      onSubmit={submit}
      noValidate
      aria-busy={isSubmitting}
    >
      <div className={styles.inner}>
        <div className={styles.row}>
          <Textarea
            {...register('content')}
            aria-label={t('composer.label')}
            placeholder={t('composer.placeholder')}
            onKeyDown={handleKeyDown}
            autosize
            minRows={1}
            maxRows={8}
            readOnly={isSubmitting}
            error={Boolean(message)}
          />
        </div>
        {message && (
          <p className={styles.error} role="alert">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
