import {
  ArrowUp,
  ChevronDown,
  Hash,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Plus,
  Search,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import styles from './ProductPreviewSection.module.scss';

// ==================== CONTENT ====================

const workspaceNavigation = [
  { label: 'overview', icon: LayoutDashboard },
  { label: 'conversations', icon: MessagesSquare },
  { label: 'announcements', icon: Megaphone },
  { label: 'search', icon: Search },
] as const;

const channels = ['general', 'frontend', 'backend', 'announcements'] as const;

const messages = [
  { person: 'ihor', initials: 'IH', time: '10:42', content: 'contract' },
  { person: 'anna', initials: 'AN', time: '10:44', content: 'review' },
  { person: 'oleh', initials: 'OL', time: '10:46', content: 'nextStep' },
] as const;

// ==================== COMPONENT ====================

export function ProductPreviewSection() {
  // ==================== TRANSLATIONS ====================

  const product = useTranslations('product');
  const presence = useTranslations('presence');

  return (
    <section id="product" className={styles.root}>
      <div className={styles.introduction}>
        <p className={styles.eyebrow}>{product('preview.eyebrow')}</p>
        <h2>{product('preview.title')}</h2>
        <p className={styles.description}>{product('preview.description')}</p>
      </div>

      <div className={styles.mediaFrame} aria-hidden="true">
        <div className={styles.interface}>
          {/* ==================== APPLICATION BAR ==================== */}

          <div className={styles.applicationBar}>
            <strong className={styles.brand}>{product('name')}</strong>
            <span className={styles.workspaceSelector}>
              <span>{product('preview.workspaceName')}</span>
              <ChevronDown size={14} />
            </span>
            <span className={styles.applicationSearch}>
              <Search size={15} />
              <span>{product('navigation.search')}</span>
            </span>
            <span className={styles.applicationAvatar}>IH</span>
          </div>

          <div className={styles.workspaceBody}>
            {/* ==================== WORKSPACE NAVIGATION ==================== */}

            <div className={styles.workspaceSidebar}>
              <ul className={styles.workspaceNavigation}>
                {workspaceNavigation.map(({ label, icon: Icon }) => (
                  <li
                    key={label}
                    className={
                      label === 'conversations'
                        ? styles.activeNavigation
                        : undefined
                    }
                  >
                    <Icon size={16} />
                    <span>{product(`navigation.${label}`)}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.channelGroup}>
                <span className={styles.groupHeading}>
                  {product('concepts.channels')}
                </span>
                <ul className={styles.channelList}>
                  {channels.map(channel => (
                    <li
                      key={channel}
                      className={
                        channel === 'general' ? styles.activeChannel : undefined
                      }
                    >
                      <Hash size={14} />
                      <span>{channel}</span>
                    </li>
                  ))}
                </ul>
                <span className={styles.newChannel}>
                  <Plus size={14} />
                  {product('actions.newChannel')}
                </span>
              </div>

              <div className={styles.userPanel}>
                <span className={styles.userAvatar}>IH</span>
                <div className={styles.userDetails}>
                  <strong>{product('preview.people.ihor')}</strong>
                  <span className={styles.userStatus}>
                    <span className={styles.busyDot} />
                    {presence('doNotDisturb')}
                  </span>
                </div>
              </div>
            </div>

            {/* ==================== CHANNEL CONTENT ==================== */}

            <div className={styles.conversation}>
              <div className={styles.channelHeader}>
                <div className={styles.channelTitle}>
                  <strong>
                    <Hash size={18} /> general
                  </strong>
                  <span>{product('preview.channelDescription')}</span>
                </div>
                <span className={styles.members}>
                  {product('preview.members', { count: 8 })}
                </span>
              </div>

              <div className={styles.messageArea}>
                <span className={styles.dateLabel}>
                  {product('preview.today')}
                </span>
                <div className={styles.messages}>
                  {messages.map(({ person, initials, time, content }) => (
                    <div key={person} className={styles.message}>
                      <span className={styles.messageAvatar}>{initials}</span>
                      <div className={styles.messageContent}>
                        <div className={styles.messageMeta}>
                          <strong>{product(`preview.people.${person}`)}</strong>
                          <span>{time}</span>
                        </div>
                        <p>{product(`preview.messages.${content}`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.composerArea}>
                <div className={styles.composer}>
                  <span>{product('preview.messagePlaceholder')}</span>
                  <span className={styles.sendMark}>
                    <ArrowUp size={16} />
                  </span>
                </div>
                <span className={styles.presenceSummary}>
                  <span className={styles.onlineDot} />
                  {presence('online', { count: 3 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
