'use client';

import { Modal } from '@mantine/core';
import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getWorkspaceManagementErrorKey } from '@/domains/workspace/model/workspace';
import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';

import { useSettingsView } from './hooks/use-settings-view';
import styles from './SettingsView.module.scss';

// ==================== PAGE VIEW ====================

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

  // ==================== DERIVED STATE ====================

  const monogram = workspace.data.name.trim().charAt(0).toUpperCase();

  // ==================== RENDER ====================

  return (
    <div className={styles.page}>
      {/* ==================== PAGE HEADER ==================== */}

      <header className={styles.header}>
        <span className={styles.monogram} aria-hidden="true">
          {monogram}
        </span>
        <div className={styles.headerText}>
          <span className={styles.workspaceName}>{workspace.data.name}</span>
          <h1>{management('settingsTitle')}</h1>
          <p>{management('settingsDescription')}</p>
        </div>
        <span className={styles.role}>{roles(workspace.data.role)}</span>
      </header>

      {/* ==================== GENERAL SETTINGS ==================== */}

      <section
        className={styles.panel}
        aria-labelledby="general-settings-heading"
      >
        <h2 id="general-settings-heading" className={styles.panelHeading}>
          {management('generalTitle')}
        </h2>

        <form onSubmit={event => void saveName(event)} noValidate>
          <div className={styles.setting}>
            <div className={styles.settingText}>
              <h3>{management('nameTitle')}</h3>
              <p>{management('nameDescription')}</p>
            </div>
            <div className={styles.field}>
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
            </div>
          </div>

          <div className={styles.panelFooter}>
            {rename.isSuccess && (
              <InlineStatus tone="success" variant="plain" role="status">
                {management('saved')}
              </InlineStatus>
            )}
            <Button
              type="submit"
              loading={rename.isPending}
              className={styles.footerAction}
            >
              {management('save')}
            </Button>
          </div>
        </form>
      </section>

      {/* ==================== DANGER ZONE ==================== */}

      {isOwner && (
        <section
          className={`${styles.panel} ${styles.dangerPanel}`}
          aria-labelledby="delete-workspace-heading"
        >
          <h2 id="delete-workspace-heading" className={styles.panelHeading}>
            <TriangleAlert size={16} aria-hidden="true" />
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
