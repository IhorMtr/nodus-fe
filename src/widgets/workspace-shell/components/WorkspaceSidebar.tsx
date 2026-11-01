'use client';

import { Menu, Modal } from '@mantine/core';
import {
  Hash,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Users,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Settings,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { User } from '@/domains/user/model/current-user';
import { Link } from '@/shared/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { InlineStatus } from '@/shared/ui/inline-status';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';

import { UserProfile } from './UserProfile';
import { useWorkspaceSidebar } from './use-workspace-sidebar';
import styles from './WorkspaceSidebar.module.scss';

// ==================== NAVIGATION SECTIONS ====================

// Search is opened from the shell toolbar, so it is not repeated here.
const sections = [
  { route: 'overview', icon: LayoutDashboard },
  { route: 'conversations', icon: MessagesSquare },
  { route: 'announcements', icon: Megaphone },
  { route: 'members', icon: Users },
  { route: 'settings', icon: Settings },
] as const;

// ==================== CONSTANTS ====================

const MAX_VISIBLE_UNREAD = 99;

export function WorkspaceSidebar({
  workspaceId,
  user,
  onNavigate,
}: {
  workspaceId: string;
  user: User;
  onNavigate?: () => void;
}) {
  // ==================== VIEW STATE ====================

  const t = useTranslations('workspace');
  const channel = useTranslations('channel');
  const {
    pathname,
    channelId,
    channels,
    canManage,
    createChannel,
    renameChannel,
    deleteChannel,
    editor,
    selected,
    deleteError,
    register,
    errors,
    status,
    openEditor,
    closeEditor,
    submitEditor,
    confirmDelete,
    requestDelete,
    closeDelete,
  } = useWorkspaceSidebar(workspaceId, user, onNavigate);

  // ==================== RENDER ====================
  return (
    <aside className={styles.sidebar} aria-label={t('navigation.sidebar')}>
      <nav className={styles.scrollArea} aria-label={t('navigation.sidebar')}>
        <ul className={styles.primaryNav}>
          {sections.map(({ route, icon: Icon }) => {
            if (route === 'settings' && !canManage) {
              return null;
            }

            const active = pathname.endsWith(`/${route}`);
            return (
              <li key={route}>
                <Link
                  href={{
                    pathname: `/workspaces/[workspaceId]/${route}`,
                    params: { workspaceId },
                  }}
                  className={styles.navLink}
                  aria-current={active ? 'page' : undefined}
                  onClick={onNavigate}
                >
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  <span>{t(`navigation.${route}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className={styles.channelSection}>
          <div className={styles.sectionHeading}>
            <span>{t('navigation.channels')}</span>
            {canManage && (
              <button
                type="button"
                className={styles.headingAction}
                aria-label={channel('actions.create')}
                title={channel('actions.create')}
                onClick={() => openEditor('create')}
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          {channels.isPending && (
            <div className={styles.state}>
              <Spinner label={channel('states.loading')} />
            </div>
          )}
          {channels.isError && (
            <div className={styles.state} role="status">
              <p>
                {status === 403
                  ? t('states.accessDenied')
                  : channel('states.loadError')}
              </p>
              <button type="button" onClick={() => void channels.refetch()}>
                {t('actions.retry')}
              </button>
            </div>
          )}
          {channels.isSuccess && channels.data.length === 0 && (
            <p className={styles.empty}>{channel('states.empty')}</p>
          )}
          {channels.isSuccess && channels.data.length > 0 && (
            <ul className={styles.channelList}>
              {channels.data.map(item => (
                <li key={item.id} className={styles.channelRow}>
                  {/* ==================== CHANNEL LINK ==================== */}

                  <Link
                    href={{
                      pathname:
                        '/workspaces/[workspaceId]/channels/[channelId]',
                      params: { workspaceId, channelId: item.id },
                    }}
                    className={styles.navLink}
                    aria-current={channelId === item.id ? 'page' : undefined}
                    aria-label={
                      item.unreadCount > 0
                        ? channel('unread.linkLabel', {
                            name: item.name,
                            count: item.unreadCount,
                          })
                        : undefined
                    }
                    data-unread={item.hasUnread || undefined}
                    onClick={onNavigate}
                    title={item.name}
                  >
                    <Hash size={17} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.name}</span>

                    {/* ==================== UNREAD INDICATOR ==================== */}

                    {item.unreadCount > 0 && (
                      <span className={styles.unreadBadge} aria-hidden="true">
                        {item.unreadCount > MAX_VISIBLE_UNREAD
                          ? `${MAX_VISIBLE_UNREAD}+`
                          : item.unreadCount}
                      </span>
                    )}
                  </Link>
                  {canManage && (
                    <Menu position="bottom-end" shadow="sm" withinPortal>
                      <Menu.Target>
                        <button
                          type="button"
                          className={styles.channelAction}
                          aria-label={channel('actions.more', {
                            name: item.name,
                          })}
                        >
                          <MoreHorizontal size={17} aria-hidden="true" />
                        </button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<Pencil size={15} />}
                          onClick={() => openEditor('rename', item)}
                        >
                          {channel('actions.rename')}
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<Trash2 size={15} />}
                          color="red"
                          onClick={() => requestDelete(item)}
                        >
                          {channel('actions.delete')}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
      <UserProfile
        user={user}
        workspaceId={workspaceId}
        pathname={pathname}
        channelId={channelId}
        onNavigate={onNavigate}
      />
      {canManage && (
        <>
          <Modal
            opened={editor !== null}
            onClose={closeEditor}
            title={channel(
              editor === 'rename'
                ? 'management.renameTitle'
                : 'management.createTitle'
            )}
            centered
            size="sm"
            closeOnClickOutside={
              !createChannel.isPending && !renameChannel.isPending
            }
            closeOnEscape={!createChannel.isPending && !renameChannel.isPending}
          >
            <form onSubmit={submitEditor} noValidate>
              <Input
                {...register('name')}
                label={channel('management.name')}
                placeholder={channel('management.namePlaceholder')}
                error={errors.name?.message}
                autoFocus
                readOnly={createChannel.isPending || renameChannel.isPending}
                required
              />
              {errors.root?.server?.message && (
                <InlineStatus
                  tone="danger"
                  role="alert"
                  className={styles.formError}
                >
                  {errors.root.server.message}
                </InlineStatus>
              )}
              <div className={styles.modalActions}>
                <Button
                  variant="secondary"
                  onClick={closeEditor}
                  disabled={createChannel.isPending || renameChannel.isPending}
                >
                  {channel('actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={createChannel.isPending || renameChannel.isPending}
                >
                  {channel(
                    editor === 'rename' ? 'actions.save' : 'actions.create'
                  )}
                </Button>
              </div>
            </form>
          </Modal>
          <Modal
            opened={selected !== null && editor === null}
            onClose={closeDelete}
            title={channel('management.deleteTitle')}
            centered
            size="sm"
            closeOnClickOutside={!deleteChannel.isPending}
            closeOnEscape={!deleteChannel.isPending}
          >
            <p className={styles.deleteDescription}>
              {channel('management.deleteDescription', {
                name: selected?.name ?? '',
              })}
            </p>
            {deleteError && (
              <InlineStatus
                tone="danger"
                role="alert"
                className={styles.formError}
              >
                {deleteError}
              </InlineStatus>
            )}
            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                onClick={closeDelete}
                disabled={deleteChannel.isPending}
              >
                {channel('actions.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={() => void confirmDelete()}
                loading={deleteChannel.isPending}
              >
                {channel('actions.delete')}
              </Button>
            </div>
          </Modal>
        </>
      )}
    </aside>
  );
}
