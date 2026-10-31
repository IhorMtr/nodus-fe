'use client';

import { Modal } from '@mantine/core';
import { Copy, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getInviteErrorKey } from '@/domains/invite/model/invitations';
import { Button } from '@/shared/ui/button';
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
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="invites-heading">{t('management.title')}</h2>
              <p>{t('management.description')}</p>
            </div>
            <Button
              leftIcon={<Plus size={16} />}
              onClick={() => void createInvite()}
              loading={create.isPending}
              disabled={create.isPending}
            >
              {t('actions.create')}
            </Button>
          </div>
          {create.isError && (
            <p className={styles.error} role="alert">
              {t(`errors.${getInviteErrorKey(create.error)}`)}
            </p>
          )}
          {revoke.isError && (
            <p className={styles.error} role="alert">
              {t(`errors.${getInviteErrorKey(revoke.error)}`)}
            </p>
          )}

          {/* ==================== INVITATION LIST ==================== */}

          {invites.isPending && (
            <div className={styles.inlineState}>
              <Spinner label={t('management.loading')} />
            </div>
          )}
          {invites.isError && (
            <div className={styles.inlineState} role="alert">
              <p>{t(`errors.${getInviteErrorKey(invites.error)}`)}</p>
              <Button
                variant="secondary"
                onClick={() => void invites.refetch()}
              >
                {t('actions.retry')}
              </Button>
            </div>
          )}
          {invites.isSuccess && invites.data.length === 0 && (
            <p className={styles.empty}>{t('management.empty')}</p>
          )}
          {invites.isSuccess && invites.data.length > 0 && (
            <ul className={styles.list}>
              {invites.data.map(invite => (
                <li key={invite.id} className={styles.row}>
                  <div className={styles.person}>
                    <strong>{t(`status.${invite.status}`)}</strong>
                    <span>
                      {t('management.expires', {
                        date: formatDate(invite.expiresAt),
                      })}
                    </span>
                  </div>
                  {invite.status === 'active' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => revoke.mutate(invite.id)}
                      disabled={revoke.isPending}
                    >
                      {t('actions.revoke')}
                    </Button>
                  )}
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
          <input
            readOnly
            value={inviteLink ?? ''}
            onFocus={event => event.currentTarget.select()}
            aria-label={t('management.linkLabel')}
          />
          <Button
            leftIcon={<Copy size={16} />}
            onClick={() => void copyInvite()}
          >
            {t('actions.copy')}
          </Button>
          {copyState && <p role="status">{t(`management.${copyState}`)}</p>}
        </div>
      </Modal>
    </>
  );
}
