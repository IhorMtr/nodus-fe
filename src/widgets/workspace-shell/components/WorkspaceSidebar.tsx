'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Menu, Modal } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  Hash,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Search,
  Users,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import {
  channelNameSchema,
  getChannelErrorKey,
  useChannelsQuery,
  useCreateChannelMutation,
  useDeleteChannelMutation,
  useRenameChannelMutation,
  type Channel,
} from '@/domains/channel/model/channel';
import { messageHistoryKey } from '@/domains/message/model/message-history';
import type { User } from '@/domains/user/model/current-user';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import { useWorkspaceQuery } from '@/domains/workspace/model/workspace';
import { Link, usePathname, useRouter } from '@/shared/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';

import { UserProfile } from './UserProfile';
import styles from './WorkspaceSidebar.module.scss';

const sections = [
  { route: 'overview', icon: LayoutDashboard },
  { route: 'conversations', icon: MessagesSquare },
  { route: 'announcements', icon: Megaphone },
  { route: 'search', icon: Search },
  { route: 'members', icon: Users },
] as const;

export function WorkspaceSidebar({
  workspaceId,
  user,
  onNavigate,
}: {
  workspaceId: string;
  user: User;
  onNavigate?: () => void;
}) {
  const t = useTranslations('workspace');
  const channel = useTranslations('channel');
  const validation = useTranslations('channel.validation');
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { channelId } = useParams<{ channelId?: string }>();
  const channels = useChannelsQuery(workspaceId);
  const workspace = useWorkspaceQuery(workspaceId);
  const canManage =
    workspace.data?.role === 'Owner' || workspace.data?.role === 'Admin';
  const createChannel = useCreateChannelMutation(workspaceId);
  const renameChannel = useRenameChannelMutation(workspaceId);
  const deleteChannel = useDeleteChannelMutation(workspaceId);
  const [editor, setEditor] = useState<'create' | 'rename' | null>(null);
  const [selected, setSelected] = useState<Channel | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const schema = useMemo(() => channelNameSchema(validation), [validation]);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<{ name: string }>({
    resolver: yupResolver(schema),
    defaultValues: { name: '' },
  });
  const status = isAxiosError(channels.error)
    ? channels.error.response?.status
    : undefined;

  // ==================== HANDLERS ====================

  function openEditor(mode: 'create' | 'rename', item: Channel | null = null) {
    setSelected(item);
    reset({ name: item?.name ?? '' });
    clearErrors();
    setEditor(mode);
  }

  function closeEditor() {
    if (createChannel.isPending || renameChannel.isPending) {
      return;
    }
    setEditor(null);
    setSelected(null);
  }

  async function saveChannel({ name }: { name: string }) {
    if (!canManage || createChannel.isPending || renameChannel.isPending) {
      return;
    }

    const trimmedName = name.trim();
    const duplicate = channels.data?.some(
      item =>
        item.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        item.id !== selected?.id
    );
    if (duplicate) {
      setError('name', { message: channel('errors.duplicateName') });
      return;
    }

    try {
      if (editor === 'create') {
        const created = await createChannel.mutateAsync(trimmedName);
        workspaceNavigation.setLastChannelId(user.id, workspaceId, created.id);
        setEditor(null);
        onNavigate?.();
        router.push({
          pathname: '/workspaces/[workspaceId]/channels/[channelId]',
          params: { workspaceId, channelId: created.id },
        });
      } else if (editor === 'rename' && selected) {
        await renameChannel.mutateAsync({
          channelId: selected.id,
          name: trimmedName,
        });
        setEditor(null);
        setSelected(null);
      }
    } catch (error) {
      const key = getChannelErrorKey(error);
      setError(
        key === 'duplicateName' || key === 'validationFailed'
          ? 'name'
          : 'root.server',
        {
          message: channel(`errors.${key}`),
        }
      );
    }
  }

  function submitEditor(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(saveChannel)(event);
  }

  async function confirmDelete() {
    if (!canManage || !selected || deleteChannel.isPending) {
      return;
    }

    try {
      const deletedId = selected.id;
      await deleteChannel.mutateAsync(deletedId);
      await queryClient.cancelQueries({
        queryKey: messageHistoryKey(workspaceId, deletedId),
      });
      queryClient.removeQueries({
        queryKey: messageHistoryKey(workspaceId, deletedId),
      });
      workspaceNavigation.clearLastChannelId(user.id, workspaceId, deletedId);
      const next = channels.data?.find(item => item.id !== deletedId);
      setSelected(null);
      setDeleteError(null);

      if (channelId === deletedId) {
        onNavigate?.();
        router.replace(
          next
            ? {
                pathname: '/workspaces/[workspaceId]/channels/[channelId]',
                params: { workspaceId, channelId: next.id },
              }
            : {
                pathname: '/workspaces/[workspaceId]',
                params: { workspaceId },
              }
        );
      }
    } catch (error) {
      setDeleteError(channel(`errors.${getChannelErrorKey(error)}`));
    }
  }

  return (
    <aside className={styles.sidebar} aria-label={t('navigation.sidebar')}>
      <nav className={styles.scrollArea} aria-label={t('navigation.sidebar')}>
        <ul className={styles.primaryNav}>
          {sections.map(({ route, icon: Icon }) => {
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
                  <Link
                    href={{
                      pathname:
                        '/workspaces/[workspaceId]/channels/[channelId]',
                      params: { workspaceId, channelId: item.id },
                    }}
                    className={styles.navLink}
                    aria-current={channelId === item.id ? 'page' : undefined}
                    onClick={onNavigate}
                    title={item.name}
                  >
                    <Hash size={17} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.name}</span>
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
                          onClick={() => {
                            setSelected(item);
                            setDeleteError(null);
                          }}
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
                <p className={styles.formError} role="alert">
                  {errors.root.server.message}
                </p>
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
            onClose={() => {
              if (!deleteChannel.isPending) {
                setSelected(null);
              }
            }}
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
              <p className={styles.formError} role="alert">
                {deleteError}
              </p>
            )}
            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                onClick={() => setSelected(null)}
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
