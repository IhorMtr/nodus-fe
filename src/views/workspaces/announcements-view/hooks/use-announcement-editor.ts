'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  createAnnouncementSchema,
  localDateTimeToIso,
  toLocalDateTime,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  type Announcement,
  type AnnouncementFormValues,
  type UpdateAnnouncementInput,
} from '@/domains/announcement/model/announcements';

// ==================== FORM ORCHESTRATION ====================

export function useAnnouncementEditor(
  workspaceId: string,
  onSaved: () => void
) {
  const validation = useTranslations('announcement.validation');
  const schema = useMemo(
    () =>
      createAnnouncementSchema({
        titleRequired: validation('titleRequired'),
        titleMax: validation('titleMax'),
        contentRequired: validation('contentRequired'),
        contentMax: validation('contentMax'),
        dateRequired: validation('dateRequired'),
        dateInvalid: validation('dateInvalid'),
        dateFuture: validation('dateFuture'),
      }),
    [validation]
  );
  const form = useForm<AnnouncementFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      publication: 'now',
      publishAtLocal: '',
    },
  });
  const create = useCreateAnnouncementMutation(workspaceId);
  const update = useUpdateAnnouncementMutation(workspaceId);
  const submitting = useRef(false);

  // ==================== EDITOR STATE ====================

  const publication = useWatch({ control: form.control, name: 'publication' });
  const isSaving = create.isPending || update.isPending;

  // ==================== HANDLERS ====================

  const openCreate = () => {
    form.reset({
      title: '',
      content: '',
      publication: 'now',
      publishAtLocal: '',
    });
    create.reset();
    update.reset();
  };

  const openEdit = (announcement: Announcement) => {
    form.reset({
      title: announcement.title,
      content: announcement.content,
      publication: announcement.publishedAt ? 'now' : 'scheduled',
      publishAtLocal: toLocalDateTime(announcement.publishAt),
    });
    create.reset();
    update.reset();
  };

  const submit = (announcement: Announcement | null) =>
    form.handleSubmit(async values => {
      if (submitting.current) {
        return;
      }

      submitting.current = true;
      try {
        const title = values.title.trim();
        const content = values.content.trim();
        const publishAt =
          values.publication === 'scheduled'
            ? localDateTimeToIso(values.publishAtLocal)
            : null;

        if (values.publication === 'scheduled' && !publishAt) {
          form.setError('publishAtLocal', {
            message: validation('dateInvalid'),
          });
          return;
        }

        if (!announcement) {
          await create.mutateAsync({
            title,
            content,
            ...(publishAt ? { publishAt } : {}),
          });
        } else {
          const input: UpdateAnnouncementInput = { title, content };

          if (!announcement.publishedAt) {
            if (values.publication === 'now') {
              input.publishAt = null;
            } else if (
              values.publishAtLocal !== toLocalDateTime(announcement.publishAt)
            ) {
              input.publishAt = publishAt!;
            }
          }

          await update.mutateAsync({ id: announcement.id, input });
        }

        onSaved();
      } catch {
        // The mutation retains the backend error for the form to display.
      } finally {
        submitting.current = false;
      }
    });

  return {
    form,
    publication,
    create,
    update,
    isSaving,
    openCreate,
    openEdit,
    submit,
  };
}
