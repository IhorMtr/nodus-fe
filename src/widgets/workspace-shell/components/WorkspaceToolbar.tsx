'use client';

import { Popover, Tooltip } from '@mantine/core';
import { Bell, PanelRightClose, PanelRightOpen, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RefObject } from 'react';

import { NotificationPanel } from '@/domains/notification/ui/notification-panel';
import { IconButton } from '@/shared/ui/icon-button';

import type { NotificationCenter } from './use-notification-center';
import styles from './WorkspaceToolbar.module.scss';

// ==================== TYPES ====================

interface WorkspaceToolbarProps {
  isSearchActive: boolean;
  searchButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenSearch?: () => void;
  notifications: NotificationCenter;
  membersPanel?: {
    expanded: boolean;
    controls?: string;
    onToggle: () => void;
  };
}

// ==================== CONSTANTS ====================

const MAX_VISIBLE_NOTIFICATIONS = 99;

// ==================== RENDER ====================

export function WorkspaceToolbar({
  isSearchActive,
  searchButtonRef,
  onOpenSearch,
  notifications,
  membersPanel,
}: WorkspaceToolbarProps) {
  // ==================== CONTEXT ====================

  const t = useTranslations('workspace');

  // ==================== DERIVED STATE ====================

  const unreadCount = notifications.count.data ?? 0;
  const membersLabel = membersPanel?.expanded
    ? t('membersPanel.hide')
    : t('membersPanel.show');

  // ==================== HANDLERS ====================

  const toggleNotifications = () => {
    if (notifications.opened) {
      notifications.close();
      return;
    }

    notifications.open();
  };

  return (
    <div className={styles.toolbar}>
      {/* ==================== SEARCH ==================== */}

      {onOpenSearch && (
        <Tooltip label={t('navigation.search')}>
          <IconButton
            ref={searchButtonRef}
            icon={<Search />}
            variant="ghost"
            aria-label={t('navigation.search')}
            aria-pressed={isSearchActive}
            onClick={onOpenSearch}
          />
        </Tooltip>
      )}

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
                onClick={toggleNotifications}
              />
            </Tooltip>
            {unreadCount > 0 && (
              <span
                className={styles.badge}
                aria-label={`${unreadCount} ${t('navigation.unreadNotifications')}`}
              >
                {unreadCount > MAX_VISIBLE_NOTIFICATIONS
                  ? `${MAX_VISIBLE_NOTIFICATIONS}+`
                  : unreadCount}
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

      {/* ==================== MEMBERS PANEL TOGGLE ==================== */}

      {membersPanel && (
        <Tooltip label={membersLabel}>
          <IconButton
            icon={
              membersPanel.expanded ? <PanelRightClose /> : <PanelRightOpen />
            }
            variant="ghost"
            aria-label={membersLabel}
            aria-expanded={membersPanel.expanded}
            aria-controls={membersPanel.controls}
            onClick={membersPanel.onToggle}
          />
        </Tooltip>
      )}
    </div>
  );
}
