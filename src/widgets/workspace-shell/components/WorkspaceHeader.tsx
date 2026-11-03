'use client';

import { Menu } from '@mantine/core';
import {
  Check,
  ChevronDown,
  Hash,
  LayoutDashboard,
  Megaphone,
  Menu as MenuIcon,
  MessagesSquare,
  Plus,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RefObject } from 'react';

import { Link } from '@/shared/i18n/navigation';
import { IconButton } from '@/shared/ui/icon-button';

import { useNotificationCenter } from './use-notification-center';
import {
  useWorkspaceHeader,
  type WorkspaceContext,
} from './use-workspace-header';
import styles from './WorkspaceHeader.module.scss';
import { WorkspaceToolbar } from './WorkspaceToolbar';

// ==================== TYPES ====================

interface WorkspaceHeaderProps {
  workspaceId: string;
  workspaceName: string;
  userId: string;
  membersPanel?: {
    expanded: boolean;
    controls?: string;
    onToggle: () => void;
  };
  onOpenSidebar: () => void;
  onOpenSearch?: () => void;
  isSearchActive: boolean;
  searchButtonRef: RefObject<HTMLButtonElement | null>;
}

// ==================== CONSTANTS ====================

const sectionIcons = {
  overview: LayoutDashboard,
  conversations: MessagesSquare,
  announcements: Megaphone,
  search: Search,
  members: Users,
  settings: Settings,
  'personal-settings': Settings,
} as const;

// ==================== HELPERS ====================

function ContextIcon({ context }: { context: NonNullable<WorkspaceContext> }) {
  const Icon =
    context.kind === 'channel' ? Hash : sectionIcons[context.section];

  return <Icon size={18} strokeWidth={1.8} aria-hidden="true" />;
}

// ==================== RENDER ====================

export function WorkspaceHeader({
  workspaceId,
  workspaceName,
  userId,
  membersPanel,
  onOpenSidebar,
  onOpenSearch,
  isSearchActive,
  searchButtonRef,
}: WorkspaceHeaderProps) {
  // ==================== CONTEXT ====================

  const t = useTranslations('workspace');
  const product = useTranslations('product');
  const user = useTranslations('user');

  // ==================== FEATURE HOOKS ====================

  const { workspaces, context, retryWorkspaces } =
    useWorkspaceHeader(workspaceId);
  const notifications = useNotificationCenter(
    userId,
    workspaceId,
    workspaces.data?.map(workspace => workspace.id) ?? []
  );

  // ==================== DERIVED STATE ====================

  let contextTitle: string | null = null;

  if (context?.kind === 'channel') {
    contextTitle = context.name;
  } else if (context?.kind === 'section') {
    contextTitle =
      context.section === 'personal-settings'
        ? user('settings.title')
        : t(`navigation.${context.section}`);
  }

  return (
    <header className={styles.header}>
      {/* ==================== WORKSPACE IDENTITY ==================== */}

      <div className={styles.identity}>
        <span className={styles.mobileMenu}>
          <IconButton
            icon={<MenuIcon />}
            variant="ghost"
            data-settings-return-focus
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
          <Menu.Dropdown>
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

      {/* ==================== CURRENT CONTEXT ==================== */}

      <div className={styles.context}>
        {context && contextTitle && (
          <>
            <ContextIcon context={context} />
            <span className={styles.contextTitle} title={contextTitle}>
              {contextTitle}
            </span>
          </>
        )}
      </div>

      {/* ==================== TOOLBAR ==================== */}

      <WorkspaceToolbar
        isSearchActive={isSearchActive}
        searchButtonRef={searchButtonRef}
        onOpenSearch={onOpenSearch}
        notifications={notifications}
        membersPanel={membersPanel}
      />
    </header>
  );
}
