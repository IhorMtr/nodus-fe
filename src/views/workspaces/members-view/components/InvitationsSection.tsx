'use client';

import { Modal } from '@mantine/core';
import { Copy, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getInviteErrorKey } from '@/domains/invite/model/invitations';
import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';

import type { useInvitationManagement } from '../hooks/use-invitation-management';
import styles from '../MembersView.module.scss';

// ==================== INVITATIONS AND SHARING ====================

export function InvitationsSection({
  state,
  canManage,
}: {
  state: ReturnType<typeof useInvitationManagement>;
  canManage: boolean;
}) {
  // ==================== CONTEXT ====================

  const t = useTranslations('invite');
  const {
    invites,
    create,
    revoke,
    inviteLink,
    copyState,
    createInvite,
    copyInvite,
    closeInvite,
    formatDate,
  } = state;

  // ==================== RENDER ====================

  return (
    <>
      {canManage && (
        <section className={styles.section} aria-labelledby="invites-heading">
          {/* ==================== SECTION HEADER ==================== */}

          <div className={styles.sectionHeader}>
            <div>
              <h2 id="invites-heading">{t('management.title')}</h2>
              <p>{t('management.description')}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => void createInvite()}
              loading={create.isPending}
              disabled={create.isPending}
            >
              {t('actions.create')}
            </Button>
          </div>

          {/* ==================== ACTION ERRORS ==================== */}

          {create.isError && (
            <InlineStatus tone="danger" role="alert" className={styles.error}>
              {t(`errors.${getInviteErrorKey(create.error)}`)}
            </InlineStatus>
          )}
          {revoke.isError && (
            <InlineStatus tone="danger" role="alert" className={styles.error}>
              {t(`errors.${getInviteErrorKey(revoke.error)}`)}
            </InlineStatus>
          )}

          {/* ==================== INVITATION LIST ==================== */}

          {invites.isPending && (
            <div className={styles.inlineState}>
              <Spinner size="sm" label={t('management.loading')} />
            </div>
          )}
          {invites.isError && (
            <InlineStatus
              tone="danger"
              role="alert"
              className={styles.error}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void invites.refetch()}
                >
                  {t('actions.retry')}
                </Button>
              }
            >
              {t(`errors.${getInviteErrorKey(invites.error)}`)}
            </InlineStatus>
          )}
          {invites.isSuccess && invites.data.length === 0 && (
            <p className={styles.empty}>{t('management.empty')}</p>
          )}
          {invites.isSuccess && invites.data.length > 0 && (
            <ul className={styles.list}>
              {invites.data.map(invite => (
                <li key={invite.id} className={styles.inviteRow}>
                  <span className={styles.status} data-status={invite.status}>
                    {t(`status.${invite.status}`)}
                  </span>
                  <div className={styles.inviteDates}>
                    <span>
                      {t('management.created', {
                        date: formatDate(invite.createdAt),
                      })}
                    </span>
                    <span>
                      {t('management.expires', {
                        date: formatDate(invite.expiresAt),
                      })}
                    </span>
                  </div>
                  <div className={styles.rowActions}>
                    {invite.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revoke.mutate(invite.id)}
                        disabled={revoke.isPending}
                      >
                        {t('actions.revoke')}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ==================== INVITATION SHARING ==================== */}

      <Modal
        opened={inviteLink !== null}
        onClose={closeInvite}
        title={t('management.shareTitle')}
        centered
      >
        <div className={styles.modalBody}>
          <p>{t('management.onceOnly')}</p>
          <div className={styles.shareRow}>
            <Input
              readOnly
              fullWidth
              value={inviteLink ?? ''}
              onFocus={event => event.currentTarget.select()}
              aria-label={t('management.linkLabel')}
            />
            <Button
              leftIcon={<Copy size={15} />}
              onClick={() => void copyInvite()}
            >
              {t('actions.copy')}
            </Button>
          </div>
          {copyState && (
            <InlineStatus
              tone={copyState === 'copied' ? 'success' : 'danger'}
              variant="plain"
              role="status"
            >
              {t(`management.${copyState}`)}
            </InlineStatus>
          )}
        </div>
      </Modal>
    </>
  );
}
