'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import type { WorkspaceMetrics } from '@/domains/workspace/model/workspace';

import styles from './OverviewView.module.scss';

// ==================== TYPES ====================

interface OverviewMetricsProps {
  metrics: WorkspaceMetrics;
}

// ==================== RENDER ====================

export function OverviewMetrics({ metrics }: OverviewMetricsProps) {
  const t = useTranslations('workspace.overview');
  const locale = useLocale();
  const [period, setPeriod] = useState<7 | 30>(7);
  const activity =
    period === 7 ? metrics.activity.last7Days : metrics.activity.last30Days;
  const number = new Intl.NumberFormat(locale);
  const since = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(activity.since)
  );

  return (
    <section className={styles.metrics} aria-labelledby="overview-metrics">
      {/* ==================== TOTALS ==================== */}

      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>{t('insights')}</span>
          <h2 id="overview-metrics">{t('metricsTitle')}</h2>
        </div>
      </div>
      <div className={styles.metricTotals}>
        <div>
          <strong>{number.format(metrics.totals.members)}</strong>
          <span>{t('members')}</span>
        </div>
        <div>
          <strong>{number.format(metrics.totals.channels)}</strong>
          <span>{t('channels')}</span>
        </div>
        <div>
          <strong>{number.format(metrics.totals.messages)}</strong>
          <span>{t('channelMessages')}</span>
        </div>
        <div>
          <strong>{number.format(metrics.totals.directMessages)}</strong>
          <span>{t('directMessages')}</span>
        </div>
        <div>
          <strong>{number.format(metrics.totals.announcements)}</strong>
          <span>{t('allAnnouncements')}</span>
        </div>
        <div>
          <strong>
            {number.format(metrics.totals.publishedAnnouncements)}
          </strong>
          <span>{t('publishedAnnouncements')}</span>
        </div>
      </div>

      {/* ==================== ACTIVITY ==================== */}

      <div className={styles.activityHeading}>
        <div>
          <h3>{t('activityTitle')}</h3>
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
      <div className={styles.activityGrid}>
        <div>
          <span>{t('channelMessages')}</span>
          <strong>{number.format(activity.messages)}</strong>
        </div>
        <div>
          <span>{t('directMessages')}</span>
          <strong>{number.format(activity.directMessages)}</strong>
        </div>
        <div>
          <span>{t('createdAnnouncements')}</span>
          <strong>{number.format(activity.announcements)}</strong>
        </div>
        <div>
          <span>{t('activeMembers')}</span>
          <strong>{number.format(activity.activeMembers)}</strong>
        </div>
      </div>
      <p className={styles.metricNote}>{t('activeMembersHint')}</p>
    </section>
  );
}
