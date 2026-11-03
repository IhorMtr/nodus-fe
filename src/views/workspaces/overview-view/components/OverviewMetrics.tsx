'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import type { WorkspaceMetrics } from '@/domains/workspace/model/workspace';

import styles from './OverviewMetrics.module.scss';

// ==================== TYPES ====================

interface OverviewMetricsProps {
  metrics: WorkspaceMetrics;
}

type ActivityPeriod = 7 | 30;

// ==================== TOTALS ====================

export function MetricTotals({ metrics }: OverviewMetricsProps) {
  const t = useTranslations('workspace.overview');
  const locale = useLocale();
  const number = new Intl.NumberFormat(locale);

  const totals = [
    { key: 'members', value: metrics.totals.members },
    { key: 'channels', value: metrics.totals.channels },
    { key: 'channelMessages', value: metrics.totals.messages },
    { key: 'directMessages', value: metrics.totals.directMessages },
    { key: 'allAnnouncements', value: metrics.totals.announcements },
    {
      key: 'publishedAnnouncements',
      value: metrics.totals.publishedAnnouncements,
    },
  ] as const;

  return (
    <section className={styles.totals} aria-labelledby="overview-metrics">
      <h2 id="overview-metrics" className={styles.visuallyHidden}>
        {t('metricsTitle')}
      </h2>
      <dl className={styles.totalsList}>
        {totals.map(total => (
          <div key={total.key} className={styles.total}>
            <dt>{t(total.key)}</dt>
            <dd>{number.format(total.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ==================== ACTIVITY ====================

export function ActivitySummary({ metrics }: OverviewMetricsProps) {
  // ==================== STATE ====================

  const t = useTranslations('workspace.overview');
  const locale = useLocale();
  const [period, setPeriod] = useState<ActivityPeriod>(7);

  // ==================== DERIVED STATE ====================

  const activity =
    period === 7 ? metrics.activity.last7Days : metrics.activity.last30Days;
  const number = new Intl.NumberFormat(locale);
  const since = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(activity.since)
  );
  const totalMembers = metrics.totals.members;
  const activeShare =
    totalMembers > 0
      ? Math.min(100, (activity.activeMembers / totalMembers) * 100)
      : 0;

  const counters = [
    { key: 'channelMessages', value: activity.messages },
    { key: 'directMessages', value: activity.directMessages },
    { key: 'createdAnnouncements', value: activity.announcements },
  ] as const;

  // ==================== RENDER ====================

  return (
    <section className={styles.activity} aria-labelledby="overview-activity">
      {/* ==================== HEADING AND PERIOD ==================== */}

      <div className={styles.activityHeader}>
        <div>
          <h2 id="overview-activity">{t('activityTitle')}</h2>
          <p>{t('activitySince', { date: since })}</p>
        </div>
        <div
          className={styles.period}
          role="group"
          aria-label={t('periodLabel')}
        >
          <button
            type="button"
            aria-pressed={period === 7}
            onClick={() => setPeriod(7)}
          >
            {t('last7Days')}
          </button>
          <button
            type="button"
            aria-pressed={period === 30}
            onClick={() => setPeriod(30)}
          >
            {t('last30Days')}
          </button>
        </div>
      </div>

      {/* ==================== ACTIVE MEMBERS ==================== */}

      <div className={styles.activeMembers}>
        <span className={styles.activeLabel}>{t('activeMembers')}</span>
        <p className={styles.activeValue}>
          <strong>{number.format(activity.activeMembers)}</strong>
          <span>
            {t('activeOfTotal', { total: number.format(totalMembers) })}
          </span>
        </p>
        <div className={styles.meter} aria-hidden="true">
          <span style={{ width: `${activeShare}%` }} />
        </div>
        <p className={styles.note}>{t('activeMembersHint')}</p>
      </div>

      {/* ==================== COUNTERS ==================== */}

      <dl className={styles.counters}>
        {counters.map(counter => (
          <div key={counter.key} className={styles.counter}>
            <dt>{t(counter.key)}</dt>
            <dd>{number.format(counter.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
