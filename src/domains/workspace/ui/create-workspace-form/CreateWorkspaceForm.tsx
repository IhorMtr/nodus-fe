'use client';

import { useTranslations } from 'next-intl';
import type { FormEventHandler } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Input } from '@/shared/ui/input';

import styles from './CreateWorkspaceForm.module.scss';

// ==================== TYPES ====================

export type CreateWorkspaceFormProps = {
  nameField: UseFormRegisterReturn<'name'> & { error?: string };
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  formError?: string;
};

// ==================== RENDER ====================

export function CreateWorkspaceForm({
  nameField,
  onSubmit,
  isSubmitting,
  formError,
}: CreateWorkspaceFormProps) {
  const t = useTranslations('workspace');

  return (
    <form
      className={styles.form}
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <Input
        {...nameField}
        id="workspace-name"
        label={t('fields.name')}
        placeholder={t('fields.namePlaceholder')}
        autoComplete="organization"
        readOnly={isSubmitting}
        required
      />
      {formError && (
        <InlineStatus tone="danger" role="alert">
          {formError}
        </InlineStatus>
      )}
      <Button
        type="submit"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {t('creation.submit')}
      </Button>
    </form>
  );
}
