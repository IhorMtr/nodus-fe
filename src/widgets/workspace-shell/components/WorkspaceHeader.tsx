'use client';

import {
  ArrowLeft,
  ChevronRight,
  Hash,
  LayoutDashboard,
  Megaphone,
  Menu as MenuIcon,
  MessagesSquare,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RefObject } from 'react';

import { getChannelColor } from '@/domains/channel/ui/channel-identity';
import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import { Link } from '@/shared/i18n/navigation';
import { Avatar } from '@/shared/ui/avatar';
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

type ConversationContext = Extract<
  NonNullable<WorkspaceContext>,
  { kind: 'conversation' }
>;

// ==================== CONSTANTS ====================

const ICON_SIZE = 18;
const ICON_STROKE = 1.8;

const sectionIcons = {
  overview: LayoutDashboard,
  conversations: MessagesSquare,
  announcements: Megaphone,
  search: Search,
  members: Users,
  settings: Settings,
  'personal-settings': Settings,
} as const;

// ==================== CONVERSATION BREADCRUMB ====================

function ConversationTitle({
  workspaceId,
  context,
}: {
  workspaceId: string;
  context: ConversationContext;
}) {
  const t = useTranslations('workspace');
  const conversation = useTranslations('conversation');

  return (
    <>
      <Link
        href={{
          pathname: '/workspaces/[workspaceId]/conversations',
          params: { workspaceId },
        }}
        className={styles.crumb}
        aria-label={conversation('backToList')}
      >
        <ArrowLeft
          className={styles.crumbBack}
          size={ICON_SIZE}
          aria-hidden="true"
        />
        <MessagesSquare
          className={styles.crumbIcon}
          size={ICON_SIZE}
          strokeWidth={ICON_STROKE}
          aria-hidden="true"
        />
        <span className={styles.crumbLabel}>
          {t('navigation.conversations')}
        </span>
      </Link>
      <ChevronRight
        className={styles.crumbSeparator}
        size={16}
        aria-hidden="true"
      />
      <Avatar initials={context.initials} size="sm" />
      <span className={styles.contextTitle} title={context.name}>
        {context.name}
      </span>
      <PresenceIndicator status={context.status} className={styles.presence} />
    </>
  );
}

// ==================== CONTEXT TITLE ====================

function ContextTitle({
  workspaceId,
  context,
}: {
  workspaceId: string;
  context: NonNullable<WorkspaceContext>;
}) {
  const t = useTranslations('workspace');
  const user = useTranslations('user');

  if (context.kind === 'conversation') {
    return <ConversationTitle workspaceId={workspaceId} context={context} />;
  }

  if (context.kind === 'channel') {
    return (
      <>
        <Hash
          size={ICON_SIZE}
          strokeWidth={ICON_STROKE}
          style={{ color: getChannelColor(context.id) }}
          aria-hidden="true"
        />
        <span className={styles.contextTitle} title={context.name}>
          {context.name}
        </span>
      </>
    );
  }

  const Icon = sectionIcons[context.section];
  const title =
    context.section === 'personal-settings'
      ? user('settings.title')
      : t(`navigation.${context.section}`);

  return (
    <>
      <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
      <span className={styles.contextTitle} title={title}>
        {title}
      </span>
    </>
  );
}

// ==================== RENDER ====================

export function WorkspaceHeader({
  workspaceId,
  userId,
  membersPanel,
  onOpenSidebar,
  onOpenSearch,
  isSearchActive,
  searchButtonRef,
}: WorkspaceHeaderProps) {
  // ==================== CONTEXT ====================

  const t = useTranslations('workspace');

  // ==================== FEATURE HOOKS ====================

  const { workspaces, context } = useWorkspaceHeader(workspaceId);
  const notifications = useNotificationCenter(
    userId,
    workspaceId,
    workspaces.data?.map(workspace => workspace.id) ?? []
  );

  return (
    <header className={styles.header}>
      {/* ==================== MOBILE NAVIGATION ==================== */}

      <span className={styles.mobileMenu}>
        <IconButton
          icon={<MenuIcon />}
          variant="ghost"
          data-settings-return-focus
          aria-label={t('navigation.openSidebar')}
          onClick={onOpenSidebar}
        />
      </span>

      {/* ==================== CURRENT CONTEXT ==================== */}

      <div className={styles.context}>
        {context && (
          <ContextTitle workspaceId={workspaceId} context={context} />
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
