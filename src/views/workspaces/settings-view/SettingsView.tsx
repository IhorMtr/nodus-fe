'use client';

import { Modal } from '@mantine/core';
import { Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getWorkspaceManagementErrorKey } from '@/domains/workspace/model/workspace';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';

import styles from './SettingsView.module.scss';
import { useSettingsView } from './hooks/use-settings-view';

export function SettingsView({ workspaceId }: { workspaceId: string }) {
  // ==================== VIEW STATE ====================

  const t = useTranslations('workspace');
  const management = useTranslations('workspace.management');
  const {
    user,
    workspace,
    rename,
    remove,
    register,
    errors,
    deleteOpened,
    confirmation,
    setConfirmation,
    redirecting,
    canManage,
    isOwner,
    saveName,
    openDelete,
    closeDelete,
    confirmDelete,
    retry,
  } = useSettingsView(workspaceId);

  // ==================== LOADING AND ERROR STATES ====================

  if (workspace.isPending || user.isPending) {
    return (
      <div className={styles.state}>
        <Spinner label={t('states.loading')} />
      </div>
    );
  }

  if (workspace.isError || user.isError) {
    return (
      <div className={styles.state} role="alert">
        <p>{t('states.loadErrorDescription')}</p>
        <Button variant="secondary" onClick={retry}>
          {t('actions.retry')}
        </Button>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className={styles.state} role="alert">
        {t('states.accessDenied')}
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <Settings size={22} aria-hidden="true" />
        <div>
          <h1>{management('settingsTitle')}</h1>
          <p>{management('settingsDescription')}</p>
        </div>
      </header>

      {/* ==================== WORKSPACE NAME ==================== */}

      <section
        className={styles.section}
        aria-labelledby="workspace-name-heading"
      >
        <h2 id="workspace-name-heading">{management('nameTitle')}</h2>
        <p>{management('nameDescription')}</p>
        <form onSubmit={event => void saveName(event)} noValidate>
          <Input
            {...register('name')}
            label={t('fields.name')}
            error={errors.name?.message}
            maxLength={100}
            readOnly={rename.isPending}
            required
          />
          {rename.isError && (
            <p className={styles.error} role="alert">
              {management(
                `errors.${getWorkspaceManagementErrorKey(rename.error)}`
              )}
            </p>
          )}
          {rename.isSuccess && (
            <p className={styles.success} role="status">
              {management('saved')}
            </p>
          )}
          <Button type="submit" loading={rename.isPending}>
            {management('save')}
          </Button>
        </form>
      </section>

      {/* ==================== DELETE WORKSPACE ==================== */}

      {isOwner && (
        <section
          className={`${styles.section} ${styles.dangerSection}`}
          aria-labelledby="delete-workspace-heading"
        >
          <h2 id="delete-workspace-heading">{management('deleteTitle')}</h2>
          <p>{management('deleteDescription')}</p>
          <Button variant="danger" onClick={openDelete}>
            {management('deleteAction')}
          </Button>
        </section>
      )}

      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title={management('deleteTitle')}
        centered
        size="sm"
        closeOnClickOutside={!remove.isPending && !redirecting}
        closeOnEscape={!remove.isPending && !redirecting}
      >
        <div className={styles.modalBody}>
          <p>{management('deleteWarning', { name: workspace.data.name })}</p>
          <Input
            label={management('confirmName')}
            value={confirmation}
            onChange={event => setConfirmation(event.currentTarget.value)}
            autoComplete="off"
            disabled={remove.isPending || redirecting}
          />
          {remove.isError && (
            <p className={styles.error} role="alert">
              {management(
                `errors.${getWorkspaceManagementErrorKey(remove.error)}`
              )}
            </p>
          )}
          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={closeDelete}
              disabled={remove.isPending || redirecting}
            >
              {management('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => void confirmDelete()}
              loading={remove.isPending || redirecting}
              disabled={confirmation !== workspace.data.name}
            >
              {management('deleteAction')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
