'use client';

import { Modal } from '@mantine/core';
import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getWorkspaceManagementErrorKey } from '@/domains/workspace/model/workspace';
import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';

import styles from './SettingsView.module.scss';
import { useSettingsView } from './hooks/use-settings-view';

export function SettingsView({ workspaceId }: { workspaceId: string }) {
  // ==================== VIEW STATE ====================

  const t = useTranslations('workspace');
  const management = useTranslations('workspace.management');
  const roles = useTranslations('invite.roles');
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
      <div className={styles.state}>
        <InlineStatus
          tone="danger"
          role="alert"
          action={
            <Button variant="ghost" size="sm" onClick={retry}>
              {t('actions.retry')}
            </Button>
          }
        >
          {t('states.loadErrorDescription')}
        </InlineStatus>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className={styles.state}>
        <InlineStatus tone="warning" role="alert">
          {t('states.accessDenied')}
        </InlineStatus>
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <div className={styles.page}>
      {/* ==================== PAGE HEADER ==================== */}

      <header className={styles.intro}>
        <h1>{management('settingsTitle')}</h1>
        <p>{management('settingsDescription')}</p>
      </header>

      {/* ==================== WORKSPACE IDENTITY ==================== */}

      <div className={styles.identity}>
        <span className={styles.identityIcon} aria-hidden="true">
          <Building2 size={20} />
        </span>
        <div className={styles.identityText}>
          <span>{management('workspaceLabel')}</span>
          <strong>{workspace.data.name}</strong>
        </div>
        <span className={styles.identityRole}>
          {roles(workspace.data.role)}
        </span>
      </div>

      {/* ==================== GENERAL SETTINGS ==================== */}

      <section
        className={styles.group}
        aria-labelledby="general-settings-heading"
      >
        <h2 id="general-settings-heading" className={styles.groupHeading}>
          {management('generalTitle')}
        </h2>
        <div className={styles.setting}>
          <div className={styles.settingText}>
            <h3>{management('nameTitle')}</h3>
            <p>{management('nameDescription')}</p>
          </div>
          <form
            className={styles.form}
            onSubmit={event => void saveName(event)}
            noValidate
          >
            <Input
              {...register('name')}
              label={t('fields.name')}
              error={errors.name?.message}
              maxLength={100}
              readOnly={rename.isPending}
              required
            />
            {rename.isError && (
              <InlineStatus tone="danger" role="alert">
                {management(
                  `errors.${getWorkspaceManagementErrorKey(rename.error)}`
                )}
              </InlineStatus>
            )}
            <div className={styles.formActions}>
              <Button type="submit" loading={rename.isPending}>
                {management('save')}
              </Button>
              {rename.isSuccess && (
                <InlineStatus tone="success" variant="plain" role="status">
                  {management('saved')}
                </InlineStatus>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ==================== DELETE WORKSPACE ==================== */}

      {isOwner && (
        <section
          className={`${styles.group} ${styles.dangerSection}`}
          aria-labelledby="delete-workspace-heading"
        >
          <h2 id="delete-workspace-heading" className={styles.groupHeading}>
            {management('dangerZone')}
          </h2>
          <div className={styles.setting}>
            <div className={styles.settingText}>
              <h3>{management('deleteTitle')}</h3>
              <p>{management('deleteDescription')}</p>
            </div>
            <div className={styles.dangerAction}>
              <Button variant="danger" onClick={openDelete}>
                {management('deleteAction')}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ==================== DELETE CONFIRMATION ==================== */}

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
            <InlineStatus tone="danger" role="alert">
              {management(
                `errors.${getWorkspaceManagementErrorKey(remove.error)}`
              )}
            </InlineStatus>
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
