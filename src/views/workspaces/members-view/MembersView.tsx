'use client';

import { Modal } from '@mantine/core';
import { Copy, Plus, RefreshCw, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  getInviteErrorKey,
  useCreateInviteMutation,
  useRevokeInviteMutation,
  useWorkspaceInvitesQuery,
} from '@/domains/invite/model/invitations';
import { useWorkspaceMembersQuery } from '@/domains/workspace/model/members';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import styles from './MembersView.module.scss';

export function MembersView({ workspaceId }: { workspaceId: string }) {
  const t = useTranslations('invite');
  const locale = useLocale();
  const workspace = useWorkspaceQuery(workspaceId);
  const members = useWorkspaceMembersQuery(workspaceId);
  const canManage =
    workspace.data?.role === 'Owner' || workspace.data?.role === 'Admin';
  const invites = useWorkspaceInvitesQuery(workspaceId, canManage);
  const create = useCreateInviteMutation(workspaceId);
  const revoke = useRevokeInviteMutation(workspaceId);

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'copied' | 'failed' | null>(null);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  // ==================== HANDLERS ====================

  const createInvite = async () => {
    try {
      const invitation = await create.mutateAsync();
      const link = `${window.location.origin}/${locale}/invites#token=${encodeURIComponent(invitation.token)}`;

      setCopyState(null);
      setInviteLink(link);
    } catch {
      // The mutation error is displayed beside the action.
    }
  };

  const copyInvite = async () => {
    if (!inviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  const closeInvite = () => {
    setInviteLink(null);
    setCopyState(null);
    create.reset();
  };

  if (workspace.isPending || members.isPending) {
    return (
      <div className={styles.state}>
        <Spinner label={t('members.loading')} />
      </div>
    );
  }

  if (workspace.isError || members.isError) {
    const error = workspace.error ?? members.error;
    return (
      <div className={styles.state} role="alert">
        <h1>{t('members.title')}</h1>
        <p>{t(`errors.${getInviteErrorKey(error)}`)}</p>
        <Button
          variant="secondary"
          onClick={() => {
            if (workspace.isError) {
              void workspace.refetch();
            } else {
              void members.refetch();
            }
          }}
        >
          {t('actions.retry')}
        </Button>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <span className={styles.icon}>
          <Users size={22} aria-hidden="true" />
        </span>
        <div>
          <h1>{t('members.title')}</h1>
          <p>{t('members.description', { workspace: workspace.data.name })}</p>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="members-heading">
        <div className={styles.sectionHeader}>
          <h2 id="members-heading">{t('members.listTitle')}</h2>
          <div className={styles.headingActions}>
            <span className={styles.count}>{members.data.length}</span>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={15} />}
              onClick={() => void members.refetch()}
              disabled={members.isFetching}
            >
              {t('actions.refresh')}
            </Button>
          </div>
        </div>
        {members.data.length === 0 ? (
          <p className={styles.empty}>{t('members.empty')}</p>
        ) : (
          <ul className={styles.list}>
            {members.data.map(member => (
              <li key={member.userId} className={styles.row}>
                <div className={styles.person}>
                  <strong>
                    {member.firstName} {member.lastName}
                  </strong>
                  <span>{member.email}</span>
                </div>
                <span className={styles.role}>{t(`roles.${member.role}`)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

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
    </main>
  );
}
