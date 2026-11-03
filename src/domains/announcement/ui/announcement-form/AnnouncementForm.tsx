'use client';

import { CalendarClock, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { FormEventHandler } from 'react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';

import type { AnnouncementFormValues } from '../../model/announcements';
import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import styles from './AnnouncementForm.module.scss';

// ==================== TYPES ====================

interface AnnouncementFormProps {
  register: UseFormRegister<AnnouncementFormValues>;
  errors: FieldErrors<AnnouncementFormValues>;
  publication: AnnouncementFormValues['publication'];
  published: boolean;
  saving: boolean;
  error: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

// ==================== RENDER ====================

export function AnnouncementForm(props: AnnouncementFormProps) {
  const t = useTranslations('announcement');

  return (
    <form
      className={styles.form}
      onSubmit={props.onSubmit}
      noValidate
      aria-busy={props.saving}
    >
      {/* ==================== CONTENT FIELDS ==================== */}

      <Input
        {...props.register('title')}
        label={t('titleLabel')}
        error={props.errors.title?.message}
        maxLength={200}
        required
      />
      <Textarea
        {...props.register('content')}
        label={t('contentLabel')}
        error={props.errors.content?.message}
        minRows={7}
        maxLength={4000}
        required
      />

      {/* ==================== PUBLICATION SCHEDULE ==================== */}

      {!props.published && (
        <fieldset className={styles.schedule}>
          <legend>{t('publicationLabel')}</legend>
          <div className={styles.options}>
            <label className={styles.option}>
              <input
                type="radio"
                value="now"
                {...props.register('publication')}
              />
              <Send size={16} aria-hidden="true" />
              <span>{t('publishNow')}</span>
            </label>
            <label className={styles.option}>
              <input
                type="radio"
                value="scheduled"
                {...props.register('publication')}
              />
              <CalendarClock size={16} aria-hidden="true" />
              <span>{t('schedule')}</span>
            </label>
          </div>
          {props.publication === 'scheduled' && (
            <Input
              {...props.register('publishAtLocal')}
              type="datetime-local"
              label={t('dateLabel')}
              description={t('dateDescription')}
              error={props.errors.publishAtLocal?.message}
              required
            />
          )}
        </fieldset>
      )}

      {/* ==================== ACTIONS ==================== */}

      {props.error && (
        <InlineStatus tone="danger" role="alert">
          {props.error}
        </InlineStatus>
      )}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={props.onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" loading={props.saving} disabled={props.saving}>
          {t('save')}
        </Button>
      </div>
    </form>
  );
}
