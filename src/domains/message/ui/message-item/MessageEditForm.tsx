'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import {
  useEffect,
  useMemo,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';

import {
  messageContentSchema,
  type MessageContentForm,
} from '../../model/message-content';

import styles from './MessageEditForm.module.scss';

// ==================== TYPES ====================

type MessageEditFormProps = {
  initialContent: string;
  // Rejects when saving fails, which keeps the edited text in the field.
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  error?: string;
};

// ==================== COMPONENT ====================

export function MessageEditForm({
  initialContent,
  onSave,
  onCancel,
  isSaving,
  error,
}: MessageEditFormProps) {
  const t = useTranslations('message');
  const validation = useTranslations('message.validation');
  const submissionLock = useRef(false);
  const schema = useMemo(() => messageContentSchema(validation), [validation]);
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<MessageContentForm>({
    resolver: yupResolver(schema),
    defaultValues: { content: initialContent },
  });

  useEffect(() => {
    setFocus('content');
  }, [setFocus]);

  // ==================== HANDLERS ====================

  async function save({ content }: MessageContentForm) {
    if (submissionLock.current) return;
    // Nothing changed, so there is nothing to send.
    if (content === initialContent.trim()) return onCancel();
    submissionLock.current = true;

    try {
      await onSave(content);
    } catch {
      // The failure is reported through the error prop and the text is kept.
    } finally {
      submissionLock.current = false;
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(save)(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (!isSaving) onCancel();
      return;
    }
    if (event.key !== 'Enter' || event.shiftKey) return;
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  // ==================== RENDER ====================

  const message = errors.content?.message ?? error;

  return (
    <form
      className={styles.form}
      onSubmit={submit}
      noValidate
      aria-busy={isSaving}
    >
      <Textarea
        {...register('content')}
        aria-label={t('actions.edit')}
        onKeyDown={handleKeyDown}
        autosize
        minRows={1}
        maxRows={10}
        readOnly={isSaving}
        error={Boolean(message)}
      />
      {message && (
        <p className={styles.error} role="alert">
          {message}
        </p>
      )}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t('actions.cancel')}
        </Button>
        <Button type="submit" size="sm" loading={isSaving} disabled={isSaving}>
          {t('actions.save')}
        </Button>
      </div>
    </form>
  );
}
