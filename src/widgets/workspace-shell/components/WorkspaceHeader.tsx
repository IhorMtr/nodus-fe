'use client';

import { Menu, Tooltip } from '@mantine/core';
import {
  Bell,
  Check,
  ChevronDown,
  Menu as MenuIcon,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useWorkspacesQuery } from '@/domains/workspace/model/workspace';
import { Link, useRouter } from '@/shared/i18n/navigation';
import { IconButton } from '@/shared/ui/icon-button';

import styles from './WorkspaceHeader.module.scss';

export function WorkspaceHeader({
  workspaceId,
  workspaceName,
  onOpenSidebar,
}: {
  workspaceId: string;
  workspaceName: string;
  onOpenSidebar: () => void;
}) {
  const t = useTranslations('workspace');
  const product = useTranslations('product');
  const router = useRouter();
  const workspaces = useWorkspacesQuery();

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
              <Menu.Item onClick={() => void workspaces.refetch()}>
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
              href={{
                pathname: '/workspaces/[workspaceId]/members',
                params: { workspaceId },
              }}
              leftSection={<Users size={16} />}
            >
              {t('navigation.members')}
            </Menu.Item>
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
            onClick={() =>
              router.push({
                pathname: '/workspaces/[workspaceId]/search',
                params: { workspaceId },
              })
            }
          />
        </Tooltip>
        <Tooltip label={t('navigation.notificationsPending')}>
          <span>
            <IconButton
              icon={<Bell />}
              variant="ghost"
              aria-label={t('navigation.notificationsPending')}
              disabled
            />
          </span>
        </Tooltip>
      </div>
    </header>
  );
}
