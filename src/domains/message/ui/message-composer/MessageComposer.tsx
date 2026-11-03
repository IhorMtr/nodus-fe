'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import {
  useId,
  useMemo,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useForm } from 'react-hook-form';

import { InlineStatus } from '@/shared/ui/inline-status';
import { Textarea } from '@/shared/ui/textarea';

import {
  messageContentSchema,
  type MessageContentForm,
} from '../../model/message-content';

import styles from './MessageComposer.module.scss';

// ==================== TYPES ====================

type MessageComposerProps = {
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
  // ==================== CONTEXT AND STATE ====================

  const t = useTranslations('message');
  const validation = useTranslations('message.validation');
  const submissionLock = useRef(false);
  const hintId = useId();
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

  // ==================== DERIVED STATE ====================

  const message = errors.content?.message ?? error;

  // ==================== HANDLERS ====================

  async function send({ content }: MessageContentForm) {
    if (submissionLock.current) {
      return;
    }

    submissionLock.current = true;

    try {
      await onSubmit(content);
      reset();
      setFocus('content');
    } catch {
    } finally {
      submissionLock.current = false;
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(send)(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return;
    }

    event.preventDefault();
    if (event.currentTarget.value.trim() === '' || isSubmitting) {
      return;
    }

    event.currentTarget.form?.requestSubmit();
  }

  // ==================== RENDER ====================

  return (
    <form
      className={styles.composer}
      onSubmit={submit}
      noValidate
      aria-busy={isSubmitting}
    >
      {/* ==================== FIELD ==================== */}

      <div className={styles.box} data-error={Boolean(message) || undefined}>
        <Textarea
          {...register('content')}
          variant="plain"
          size="lg"
          aria-label={t('composer.label')}
          aria-describedby={hintId}
          placeholder={t('composer.placeholder')}
          onKeyDown={handleKeyDown}
          autosize
          minRows={1}
          maxRows={8}
          readOnly={isSubmitting}
          error={Boolean(message)}
        />
      </div>

      {/* ==================== FEEDBACK AND HINT ==================== */}

      <div className={styles.footer}>
        {message && (
          <InlineStatus tone="danger" variant="plain" role="alert">
            {message}
          </InlineStatus>
        )}
        <span id={hintId} className={styles.hint}>
          {t('composer.hint')}
        </span>
      </div>
    </form>
  );
}
