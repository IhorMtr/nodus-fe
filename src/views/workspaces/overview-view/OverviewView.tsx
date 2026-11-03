'use client';

import {
  ArrowRight,
  Hash,
  Megaphone,
  MessageCircle,
  Users,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { PresenceIndicator } from '@/domains/presence/ui/presence-indicator';
import { getWorkspaceMemberName } from '@/domains/workspace/model/members';
import { Link } from '@/shared/i18n/navigation';

import { OverviewMetrics } from './OverviewMetrics';
import styles from './OverviewView.module.scss';
import { useOverviewView } from './hooks/use-overview-view';

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
        <button type="button" onClick={onRetry}>
          {t('retry')}
        </button>
      </div>
    );
  }

  return <p className={styles.empty}>{empty}</p>;
}

// ==================== PAGE VIEW ====================

export function OverviewView({ workspaceId }: { workspaceId: string }) {
  const t = useTranslations('workspace.overview');
  const locale = useLocale();
  const state = useOverviewView(workspaceId);

  // ==================== DERIVED STATE ====================

  const showChannels =
    state.channels.isSuccess && state.visibleChannels.length > 0;
  const showAnnouncements =
    state.announcements.isSuccess && state.recentAnnouncements.length > 0;
  const showMembers =
    state.members.isSuccess && state.visibleMembers.length > 0;

  let metricsContent = null;
  if (state.canViewMetrics) {
    if (state.metrics.data) {
      metricsContent = <OverviewMetrics metrics={state.metrics.data} />;
    } else {
      metricsContent = (
        <section className={styles.metrics} aria-label={t('metricsTitle')}>
          <div className={styles.sectionHeading}>
            <h2>{t('metricsTitle')}</h2>
          </div>
          <SectionFeedback
            loading={state.metrics.isPending}
            error={state.metrics.isError}
            empty={t('metricsEmpty')}
            onRetry={() => void state.metrics.refetch()}
          />
        </section>
      );
    }
  }

  // ==================== RENDER ====================

  return (
    <div className={styles.page}>
      {/* ==================== INTRO ==================== */}
      <header className={styles.intro}>
        <span className={styles.eyebrow}>{t('eyebrow')}</span>
        <h1>{state.workspace.data?.name ?? t('workspaceFallback')}</h1>
        <p>{t('description')}</p>
      </header>

      {/* ==================== CONTENT ==================== */}
      <div className={styles.contentGrid}>
        <section
          className={styles.channels}
          aria-labelledby="overview-channels"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>{t('places')}</span>
              <h2 id="overview-channels">{t('channelsTitle')}</h2>
            </div>
            {state.channels.data && (
              <span className={styles.count}>{state.channels.data.length}</span>
            )}
          </div>
          {!showChannels && (
            <SectionFeedback
              loading={state.channels.isPending}
              error={state.channels.isError}
              empty={t('channelsEmpty')}
              onRetry={() => void state.channels.refetch()}
            />
          )}
          {showChannels && (
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
                  >
                    <Hash size={16} aria-hidden="true" />
                    <span className={styles.channelName}>{channel.name}</span>
                    {channel.unreadCount > 0 && (
                      <span
                        className={styles.unread}
                        aria-label={t('unread', { count: channel.unreadCount })}
                      >
                        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                      </span>
                    )}
                    <ArrowRight
                      size={15}
                      className={styles.rowArrow}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className={styles.announcements}
          aria-labelledby="overview-announcements"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>{t('updates')}</span>
              <h2 id="overview-announcements">{t('announcementsTitle')}</h2>
            </div>
            <Link
              href={{
                pathname: '/workspaces/[workspaceId]/announcements',
                params: { workspaceId },
              }}
              className={styles.sectionAction}
            >
              {t('viewAll')} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {!showAnnouncements && (
            <SectionFeedback
              loading={state.announcements.isPending}
              error={state.announcements.isError}
              empty={t('announcementsEmpty')}
              onRetry={() => void state.announcements.refetch()}
            />
          )}
          {showAnnouncements && (
            <ul className={styles.announcementList}>
              {state.recentAnnouncements.map(item => (
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
                      {state.authorNames.get(item.authorId.toLowerCase()) ??
                        t('unknownAuthor')}
                      <span aria-hidden="true">·</span>
                      {item.publishedAt && (
                        <time dateTime={item.publishedAt}>
                          {new Intl.DateTimeFormat(locale, {
                            dateStyle: 'medium',
                          }).format(new Date(item.publishedAt))}
                        </time>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.team} aria-labelledby="overview-team">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>{t('people')}</span>
              <h2 id="overview-team">{t('teamTitle')}</h2>
            </div>
            <Link
              href={{
                pathname: '/workspaces/[workspaceId]/members',
                params: { workspaceId },
              }}
              className={styles.sectionAction}
            >
              {t('viewAll')} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {state.members.data && (
            <p className={styles.teamSummary}>
              {t('memberCount', { count: state.members.data.length })}
            </p>
          )}
          {!showMembers && (
            <SectionFeedback
              loading={state.members.isPending}
              error={state.members.isError}
              empty={t('teamEmpty')}
              onRetry={() => void state.members.refetch()}
            />
          )}
          {showMembers && (
            <ul className={styles.memberList}>
              {state.visibleMembers.map(member => (
                <li key={member.userId}>
                  <span className={styles.memberName}>
                    {getWorkspaceMemberName(member)}
                  </span>
                  <PresenceIndicator status={member.status} withLabel={false} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.quick} aria-labelledby="overview-quick">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>{t('continue')}</span>
              <h2 id="overview-quick">{t('quickTitle')}</h2>
            </div>
          </div>
          <div className={styles.quickLinks}>
            <Link
              href={{
                pathname: '/workspaces/[workspaceId]/conversations',
                params: { workspaceId },
              }}
            >
              <MessageCircle size={17} aria-hidden="true" />
              {t('openConversations')}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link
              href={{
                pathname: '/workspaces/[workspaceId]/announcements',
                params: { workspaceId },
              }}
            >
              <Megaphone size={17} aria-hidden="true" />
              {t('openAnnouncements')}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link
              href={{
                pathname: '/workspaces/[workspaceId]/members',
                params: { workspaceId },
              }}
            >
              <Users size={17} aria-hidden="true" />
              {t('openMembers')}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>

      {/* ==================== ADMIN METRICS ==================== */}
      {metricsContent}
    </div>
  );
}
