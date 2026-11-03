'use client';

import { Menu } from '@mantine/core';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  useWorkspacesQuery,
  type Workspace,
} from '@/domains/workspace/model/workspace';
import { Link } from '@/shared/i18n/navigation';
import { Avatar } from '@/shared/ui/avatar';

import styles from './WorkspaceSwitcher.module.scss';

// ==================== HELPERS ====================

function getMonogram(name: string) {
  return name.trim().charAt(0).toUpperCase() || '#';
}

// ==================== RENDER ====================

export function WorkspaceSwitcher({
  workspace,
  onNavigate,
}: {
  workspace: Workspace;
  onNavigate?: () => void;
}) {
  // ==================== CONTEXT ====================

  const t = useTranslations('workspace');
  const roles = useTranslations('invite.roles');
  const workspaces = useWorkspacesQuery();

  return (
    <Menu position="bottom-start" width="target" withinPortal>
      {/* ==================== TRIGGER ==================== */}

      <Menu.Target>
        <button type="button" className={styles.trigger}>
          <Avatar
            initials={getMonogram(workspace.name)}
            size="sm"
            shape="square"
            className={styles.monogram}
          />
          <span className={styles.identity}>
            <strong title={workspace.name}>{workspace.name}</strong>
            <span>{roles(workspace.role)}</span>
          </span>
          <ChevronsUpDown
            className={styles.chevron}
            size={16}
            aria-hidden="true"
          />
        </button>
      </Menu.Target>

      {/* ==================== WORKSPACE LIST ==================== */}

      <Menu.Dropdown className={styles.dropdown}>
        <Menu.Label>{t('navigation.workspaces')}</Menu.Label>

        {workspaces.isPending && <Menu.Label>{t('states.loading')}</Menu.Label>}

        {workspaces.isError && (
          <Menu.Item onClick={() => void workspaces.refetch()}>
            {t('states.loadError')} · {t('actions.retry')}
          </Menu.Item>
        )}

        {workspaces.data?.map(item => {
          const current = item.id === workspace.id;

          return (
            <Menu.Item
              key={item.id}
              component={Link}
              href={{
                pathname: '/workspaces/[workspaceId]',
                params: { workspaceId: item.id },
              }}
              leftSection={
                <Avatar
                  initials={getMonogram(item.name)}
                  size="xs"
                  shape="square"
                />
              }
              rightSection={current ? <Check size={16} /> : null}
              aria-current={current ? 'page' : undefined}
              onClick={onNavigate}
            >
              <span className={styles.itemName}>{item.name}</span>
            </Menu.Item>
          );
        })}

        <Menu.Divider />

        <Menu.Item
          component={Link}
          href="/workspaces/new"
          leftSection={<Plus size={16} />}
          onClick={onNavigate}
        >
          {t('navigation.create')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
