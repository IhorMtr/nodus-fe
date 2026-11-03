'use client';

import { ArrowRight, Hash, MessageCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getChannelColor } from '@/domains/channel/ui/channel-identity';
import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import {
  getWorkspaceMemberInitials,
  getWorkspaceMemberName,
} from '@/domains/workspace/model/members';
import { Link } from '@/shared/i18n/navigation';
import { Avatar, getNameInitials } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';

import { useOverviewView } from './hooks/use-overview-view';
import { ActivitySummary, MetricTotals } from './components/OverviewMetrics';
import styles from './OverviewView.module.scss';

// ==================== CONSTANTS ====================

const MAX_VISIBLE_UNREAD = 99;

// ==================== SECTION FEEDBACK ====================

function SectionFeedback({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading: boolean;
  error: boolean;
  empty: string;
  onRetry: () => void;
}) {
  const t = useTranslations('workspace.overview');

  if (loading) {
    return <div className={styles.skeleton} aria-label={t('loading')} />;
  }

  if (error) {
    return (
      <div className={styles.feedback} role="alert">
        <span>{t('loadError')}</span>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  return <p className={styles.empty}>{empty}</p>;
}

// ==================== PAGE VIEW ====================

export function OverviewView({ workspaceId }: { workspaceId: string }) {
  // ==================== CONTEXT ====================

  const t = useTranslations('workspace.overview');
  const presence = useTranslations('presence');
  const roles = useTranslations('invite.roles');
  const locale = useLocale();
  const state = useOverviewView(workspaceId);

  // ==================== DERIVED STATE ====================

  const workspaceName = state.workspace.data?.name ?? t('workspaceFallback');
  const monogram = workspaceName.trim().charAt(0).toUpperCase();
  const publishedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  });
  const metrics = state.visibleMetrics;

  // ==================== RENDER ====================

  return (
    <div className={styles.page}>
      {/* ==================== WORKSPACE HEADER ==================== */}

      <header className={styles.header}>
        <span className={styles.monogram} aria-hidden="true">
          {monogram}
        </span>
        <div className={styles.headerText}>
          <h1>{workspaceName}</h1>
          <p>{t('description')}</p>
        </div>
        {state.members.isSuccess && (
          <p className={styles.headerMeta}>
            <span>
              {t('memberCount', { count: state.members.data.length })}
            </span>
            <span className={styles.onlineMeta}>
              <span aria-hidden="true">
                <PresenceIndicator status="online" withLabel={false} />
              </span>
              {presence('online', { count: state.onlineCount })}
            </span>
          </p>
        )}
      </header>

      {/* ==================== WORKSPACE TOTALS ==================== */}

      {metrics && <MetricTotals metrics={metrics} />}

      {state.canViewMetrics && !metrics && (
        <section
          className={styles.metricsFeedback}
          aria-label={t('metricsTitle')}
        >
          <SectionFeedback
            loading={state.metrics.isPending}
            error={state.metrics.isError}
            empty={t('metricsEmpty')}
            onRetry={() => void state.metrics.refetch()}
          />
        </section>
      )}

      <div className={styles.layout}>
        <div className={styles.main}>
          {/* ==================== CHANNELS ==================== */}

          <section
            className={styles.section}
            aria-labelledby="overview-channels"
          >
            <div className={styles.sectionHeader}>
              <h2 id="overview-channels">{t('channelsTitle')}</h2>
              {state.channels.data && (
                <span className={styles.count}>
                  {state.channels.data.length}
                </span>
              )}
            </div>

            {!state.showChannels && (
              <SectionFeedback
                loading={state.channels.isPending}
                error={state.channels.isError}
                empty={t('channelsEmpty')}
                onRetry={() => void state.channels.refetch()}
              />
            )}

            {state.showChannels && (
              <ul className={styles.channelList}>
                {state.visibleChannels.map(channel => (
                  <li key={channel.id}>
                    <Link
                      href={{
                        pathname:
                          '/workspaces/[workspaceId]/channels/[channelId]',
                        params: { workspaceId, channelId: channel.id },
                      }}
                      className={styles.channelLink}
                      data-unread={channel.unreadCount > 0 || undefined}
                    >
                      <span className={styles.channelIcon} aria-hidden="true">
                        <Hash
                          size={16}
                          style={{ color: getChannelColor(channel.id) }}
                        />
                      </span>
                      <span className={styles.channelText}>
                        <span className={styles.channelName}>
                          {channel.name}
                        </span>
                        {channel.unreadCount > 0 && (
                          <span className={styles.channelMeta}>
                            {t('unread', { count: channel.unreadCount })}
                          </span>
                        )}
                      </span>
                      {channel.unreadCount > 0 && (
                        <span className={styles.unread} aria-hidden="true">
                          {channel.unreadCount > MAX_VISIBLE_UNREAD
                            ? `${MAX_VISIBLE_UNREAD}+`
                            : channel.unreadCount}
                        </span>
                      )}
                      <ArrowRight
                        size={16}
                        className={styles.rowArrow}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ==================== LATEST ANNOUNCEMENTS ==================== */}

          <section
            className={styles.section}
            aria-labelledby="overview-announcements"
          >
            <div className={styles.sectionHeader}>
              <h2 id="overview-announcements">{t('announcementsTitle')}</h2>
              <Link
                href={{
                  pathname: '/workspaces/[workspaceId]/announcements',
                  params: { workspaceId },
                }}
                className={styles.sectionAction}
              >
                {t('viewAll')}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {!state.showAnnouncements && (
              <SectionFeedback
                loading={state.announcements.isPending}
                error={state.announcements.isError}
                empty={t('announcementsEmpty')}
                onRetry={() => void state.announcements.refetch()}
              />
            )}

            {state.showAnnouncements && (
              <ul className={styles.announcementList}>
                {state.recentAnnouncements.map(item => {
                  const author =
                    state.authorNames.get(item.authorId.toLowerCase()) ??
                    t('unknownAuthor');

                  return (
                    <li key={item.id}>
                      <Link
                        href={{
                          pathname: '/workspaces/[workspaceId]/announcements',
                          params: { workspaceId },
                          query: { announcement: item.id },
                        }}
                        className={styles.announcementLink}
                      >
                        <span className={styles.announcementTitle}>
                          {item.title}
                        </span>
                        <span className={styles.preview}>{item.content}</span>
                        <span className={styles.meta}>
                          <Avatar
                            initials={getNameInitials(author)}
                            size="xs"
                          />
                          <span>{author}</span>
                          {item.publishedAt && (
                            <>
                              <span aria-hidden="true">·</span>
                              <time dateTime={item.publishedAt}>
                                {publishedDate.format(
                                  new Date(item.publishedAt)
                                )}
                              </time>
                            </>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className={styles.aside}>
          {/* ==================== ACTIVITY ==================== */}

          {metrics && <ActivitySummary metrics={metrics} />}

          {/* ==================== TEAM ==================== */}

          <section className={styles.team} aria-labelledby="overview-team">
            <div className={styles.sectionHeader}>
              <h2 id="overview-team">{t('teamTitle')}</h2>
              <Link
                href={{
                  pathname: '/workspaces/[workspaceId]/members',
                  params: { workspaceId },
                }}
                className={styles.sectionAction}
              >
                {t('viewAll')}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {!state.showMembers && (
              <SectionFeedback
                loading={state.members.isPending}
                error={state.members.isError}
                empty={t('teamEmpty')}
                onRetry={() => void state.members.refetch()}
              />
            )}

            {state.showMembers && (
              <ul className={styles.memberList}>
                {state.visibleMembers.map(member => (
                  <li
                    key={member.userId}
                    data-offline={member.status === 'offline' || undefined}
                  >
                    <Avatar
                      initials={getWorkspaceMemberInitials(member)}
                      size="sm"
                      className={styles.memberAvatar}
                      status={
                        <PresenceIndicator
                          status={member.status}
                          withLabel={false}
                        />
                      }
                    />
                    <span className={styles.memberText}>
                      <span className={styles.memberName}>
                        {getWorkspaceMemberName(member)}
                      </span>
                      <span className={styles.memberRole}>
                        {roles(member.role)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={{
                pathname: '/workspaces/[workspaceId]/conversations',
                params: { workspaceId },
              }}
              className={styles.teamFooter}
            >
              <MessageCircle size={16} aria-hidden="true" />
              <span>{t('openConversations')}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
