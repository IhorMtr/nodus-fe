'use client';

import { Menu, Popover, Tooltip } from '@mantine/core';
import {
  Bell,
  Check,
  ChevronDown,
  Menu as MenuIcon,
  Plus,
  Search,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { NotificationPanel } from '@/domains/notification/ui/notification-panel';
import { Link } from '@/shared/i18n/navigation';
import { IconButton } from '@/shared/ui/icon-button';

import styles from './WorkspaceHeader.module.scss';
import { useWorkspaceHeader } from './use-workspace-header';
import { useNotificationCenter } from './use-notification-center';

export function WorkspaceHeader({
  workspaceId,
  workspaceName,
  userId,
  onOpenSidebar,
}: {
  workspaceId: string;
  workspaceName: string;
  userId: string;
  onOpenSidebar: () => void;
}) {
  // ==================== VIEW STATE ====================

  const t = useTranslations('workspace');
  const product = useTranslations('product');
  const { workspaces, openSearch, retryWorkspaces } =
    useWorkspaceHeader(workspaceId);
  const notifications = useNotificationCenter(
    userId,
    workspaceId,
    workspaces.data?.map(workspace => workspace.id) ?? []
  );

  // ==================== RENDER ====================

  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <span className={styles.mobileMenu}>
          <IconButton
            icon={<MenuIcon />}
            variant="ghost"
            aria-label={t('navigation.openSidebar')}
            onClick={onOpenSidebar}
          />
        </span>
        <Link href="/app" className={styles.brand} aria-label={product('name')}>
          {product('name')}
        </Link>
        <span className={styles.divider} aria-hidden="true" />
        <Menu position="bottom-start" width={260} shadow="sm" withinPortal>
          <Menu.Target>
            <button type="button" className={styles.switcher}>
              <span title={workspaceName}>{workspaceName}</span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </Menu.Target>
          <Menu.Dropdown className={styles.dropdown}>
            <Menu.Label>{t('navigation.workspaces')}</Menu.Label>
            {workspaces.isPending && (
              <Menu.Label>{t('states.loading')}</Menu.Label>
            )}
            {workspaces.isError && (
              <Menu.Item onClick={retryWorkspaces}>
                {t('states.loadError')} · {t('actions.retry')}
              </Menu.Item>
            )}
            {workspaces.data?.map(workspace => (
              <Menu.Item
                key={workspace.id}
                component={Link}
                href={{
                  pathname: '/workspaces/[workspaceId]',
                  params: { workspaceId: workspace.id },
                }}
                rightSection={
                  workspace.id === workspaceId ? <Check size={16} /> : null
                }
                aria-current={workspace.id === workspaceId ? 'page' : undefined}
                className={styles.workspaceItem}
              >
                {workspace.name}
              </Menu.Item>
            ))}
            <Menu.Divider />
            <Menu.Item
              component={Link}
              href="/workspaces/new"
              leftSection={<Plus size={16} />}
            >
              {t('navigation.create')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
      <div className={styles.actions}>
        <Tooltip label={t('navigation.search')}>
          <IconButton
            icon={<Search />}
            variant="ghost"
            aria-label={t('navigation.search')}
            onClick={openSearch}
          />
        </Tooltip>
        {/* ==================== NOTIFICATION CENTER ==================== */}

        <Popover
          opened={notifications.opened}
          onClose={notifications.close}
          position="bottom-end"
          offset={8}
          shadow="md"
          withinPortal
          classNames={{ dropdown: styles.notificationDropdown }}
        >
          <Popover.Target>
            <span className={styles.bellWrap}>
              <Tooltip label={t('navigation.notifications')}>
                <IconButton
                  icon={<Bell />}
                  variant="ghost"
                  aria-label={t('navigation.notifications')}
                  aria-expanded={notifications.opened}
                  onClick={() =>
                    notifications.opened
                      ? notifications.close()
                      : notifications.open()
                  }
                />
              </Tooltip>
              {(notifications.count.data ?? 0) > 0 && (
                <span
                  className={styles.badge}
                  aria-label={`${notifications.count.data} ${t('navigation.unreadNotifications')}`}
                >
                  {notifications.count.data! > 99
                    ? '99+'
                    : notifications.count.data}
                </span>
              )}
            </span>
          </Popover.Target>
          <Popover.Dropdown>
            <NotificationPanel
              items={notifications.items}
              navigableIds={notifications.navigableIds}
              canMarkAll={notifications.canMarkAll}
              loading={notifications.list.isPending}
              error={notifications.list.isError}
              loadingMore={notifications.list.isFetchingNextPage}
              loadMoreError={notifications.list.isFetchNextPageError}
              hasMore={notifications.list.hasNextPage}
              markingAll={notifications.markAllRead.isPending}
              markingId={
                notifications.markRead.isPending
                  ? notifications.markRead.variables
                  : null
              }
              actionError={
                notifications.markRead.isError ||
                notifications.markAllRead.isError
              }
              onRetry={() => void notifications.list.refetch()}
              onLoadMore={() => void notifications.list.fetchNextPage()}
              onMarkAllRead={notifications.onMarkAllRead}
              onMarkRead={notifications.onMarkRead}
              onSelect={notifications.onSelect}
            />
          </Popover.Dropdown>
        </Popover>
      </div>
    </header>
  );
}
