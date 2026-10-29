'use client';

import { isAxiosError } from 'axios';
import {
  Hash,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Search,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { useChannelsQuery } from '@/domains/channel/model/channel';
import type { User } from '@/domains/user/model/current-user';
import { Link, usePathname } from '@/shared/i18n/navigation';
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
  const pathname = usePathname();
  const { channelId } = useParams<{ channelId?: string }>();
  const channels = useChannelsQuery(workspaceId);
  const status = isAxiosError(channels.error)
    ? channels.error.response?.status
    : undefined;

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
                <li key={item.id}>
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
    </aside>
  );
}
