'use client';

import { Modal } from '@mantine/core';
import { Megaphone, Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getAnnouncementErrorKey } from '@/domains/announcement/model/announcements';
import { AnnouncementCard } from '@/domains/announcement/ui/announcement-card';
import { AnnouncementForm } from '@/domains/announcement/ui/announcement-form';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import styles from './AnnouncementsView.module.scss';
import { useAnnouncementsView } from './hooks/use-announcements-view';

// ==================== PAGE VIEW ====================

export function AnnouncementsView({ workspaceId }: { workspaceId: string }) {
  const t = useTranslations('announcement');
  const locale = useLocale();
  const state = useAnnouncementsView(workspaceId);
  const selected = state.detail.data;
  const editorError =
    state.announcementEditor.create.error ??
    state.announcementEditor.update.error;

  // ==================== LOADING AND ERROR STATES ====================

  if (state.workspace.isPending || state.announcements.isPending) {
    return (
      <div className={styles.state}>
        <Spinner label={t('loading')} />
      </div>
    );
  }

  if (state.workspace.isError || state.announcements.isError) {
    const error = state.workspace.error ?? state.announcements.error;
    return (
      <div className={styles.state} role="alert">
        <h1>{t('heading')}</h1>
        <p>{t(`errors.${getAnnouncementErrorKey(error)}`)}</p>
        <Button variant="secondary" onClick={state.retry}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <div className={styles.page}>
      {/* ==================== PAGE INTRO ==================== */}

      <header className={styles.intro}>
        <span className={styles.icon}>
          <Megaphone size={22} aria-hidden="true" />
        </span>
        <div className={styles.introText}>
          <h1>{t('heading')}</h1>
          <p>{t('description')}</p>
        </div>
        {state.canManage && (
          <Button leftIcon={<Plus size={16} />} onClick={state.openCreate}>
            {t('create')}
          </Button>
        )}
      </header>

      {/* ==================== ANNOUNCEMENT LIST ==================== */}

      {state.items.length === 0 ? (
        <div className={styles.empty}>
          <Megaphone size={26} aria-hidden="true" />
          <h2>{t('emptyTitle')}</h2>
          <p>{t('emptyDescription')}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {state.items.map(item => (
            <AnnouncementCard
              key={item.id}
              announcement={item}
              authorName={
                state.authorNames.get(item.authorId) ?? t('unknownAuthor')
              }
              onOpen={() => state.openDetail(item.id)}
            />
          ))}
        </div>
      )}

      {/* ==================== ANNOUNCEMENT DETAIL ==================== */}

      <Modal
        opened={Boolean(state.selectedId)}
        onClose={state.closeDetail}
        title={t('detailTitle')}
        size="lg"
        centered
      >
        {state.detail.isPending && <Spinner label={t('loadingDetail')} />}
        {state.detail.isError && (
          <div className={styles.modalState} role="alert">
            <p>{t(`errors.${getAnnouncementErrorKey(state.detail.error)}`)}</p>
            <Button
              variant="secondary"
              onClick={() => void state.detail.refetch()}
            >
              {t('retry')}
            </Button>
          </div>
        )}
        {selected && !state.detail.isError && (
          <article className={styles.detail}>
            <span className={styles.status}>
              {selected.publishedAt ? t('published') : t('scheduled')}
            </span>
            <h2>{selected.title}</h2>
            <p className={styles.meta}>
              {t('by', {
                name:
                  state.authorNames.get(selected.authorId) ??
                  t('unknownAuthor'),
              })}
              {' · '}
              {new Intl.DateTimeFormat(locale, {
                dateStyle: 'long',
                timeStyle: 'short',
              }).format(
                new Date(
                  selected.publishedAt ??
                    selected.publishAt ??
                    selected.createdAt
                )
              )}
            </p>
            <p className={styles.content}>{selected.content}</p>
            {state.publish.isError && (
              <p className={styles.error} role="alert">
                {t(`errors.${getAnnouncementErrorKey(state.publish.error)}`)}
              </p>
            )}
            {state.canManage && (
              <div className={styles.actions}>
                {!selected.publishedAt && (
                  <Button
                    variant="secondary"
                    loading={state.publish.isPending}
                    disabled={state.publish.isPending}
                    onClick={() => state.publishNow(selected)}
                  >
                    {t('publishImmediately')}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => state.openEdit(selected)}
                >
                  {t('edit')}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => state.openDelete(selected)}
                >
                  {t('delete')}
                </Button>
              </div>
            )}
          </article>
        )}
      </Modal>

      {/* ==================== CREATE AND EDIT DIALOG ==================== */}

      <Modal
        opened={state.editor !== null}
        onClose={() => {
          if (!state.announcementEditor.isSaving) {
            state.setEditor(null);
          }
        }}
        title={state.editor === 'create' ? t('create') : t('edit')}
        size="lg"
        centered
      >
        <AnnouncementForm
          register={state.announcementEditor.form.register}
          errors={state.announcementEditor.form.formState.errors}
          publication={state.announcementEditor.publication}
          published={state.editor === 'edit' && Boolean(selected?.publishedAt)}
          saving={state.announcementEditor.isSaving}
          error={
            editorError
              ? t(`errors.${getAnnouncementErrorKey(editorError)}`)
              : null
          }
          onSubmit={state.announcementEditor.submit(
            state.editor === 'edit' ? (selected ?? null) : null
          )}
          onCancel={() => {
            if (!state.announcementEditor.isSaving) {
              state.setEditor(null);
            }
          }}
        />
      </Modal>

      {/* ==================== DELETE CONFIRMATION ==================== */}

      <Modal
        opened={Boolean(state.deleteTarget)}
        onClose={state.closeDelete}
        title={t('delete')}
        centered
      >
        <div className={styles.confirmation}>
          <p>
            {t('deleteConfirmation', {
              title: state.deleteTarget?.title ?? '',
            })}
          </p>
          {state.remove.isError && (
            <p className={styles.error} role="alert">
              {t(`errors.${getAnnouncementErrorKey(state.remove.error)}`)}
            </p>
          )}
          <div className={styles.actions}>
            <Button variant="secondary" onClick={state.closeDelete}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              loading={state.remove.isPending}
              disabled={state.remove.isPending}
              onClick={() => void state.confirmDelete()}
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
