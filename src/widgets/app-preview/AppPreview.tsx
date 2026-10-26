import {
  Bell,
  ChevronDown,
  ChevronUp,
  Hash,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Search,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import styles from './AppPreview.module.scss';

// ==================== CONTENT ====================

const sections = [
  { route: 'overview', icon: LayoutDashboard },
  { route: 'conversations', icon: MessagesSquare },
  { route: 'announcements', icon: Megaphone },
  { route: 'search', icon: Search },
] as const;

const channels = ['general', 'frontend', 'backend', 'announcements'] as const;

const messages = [
  { person: 'ihor', initials: 'IH', time: '10:42', content: 'contract' },
  { person: 'anna', initials: 'AN', time: '10:44', content: 'review' },
  { person: 'oleh', initials: 'OL', time: '10:46', content: 'nextStep' },
] as const;

// ==================== COMPONENT ====================

// Static, non-interactive replica of the workspace shell with a channel open.
// It mirrors the real layout, so keep it in sync with WorkspaceShell,
// WorkspaceSidebar and the channel view.
export function AppPreview() {
  const product = useTranslations('product');
  const user = useTranslations('user');

  return (
    <div className={styles.root} aria-hidden="true">
      {/* ==================== HEADER ==================== */}

      <header className={styles.header}>
        <div className={styles.identity}>
          <strong className={styles.brand}>{product('name')}</strong>
          <span className={styles.divider} />
          <span className={styles.switcher}>
            <span>{product('preview.workspaceName')}</span>
            <ChevronDown size={16} />
          </span>
        </div>
        <div className={styles.actions}>
          <span className={styles.iconButton}>
            <Search size={20} />
          </span>
          <span className={`${styles.iconButton} ${styles.disabled}`}>
            <Bell size={20} />
          </span>
        </div>
      </header>

      <div className={styles.body}>
        {/* ==================== SIDEBAR ==================== */}

        <aside className={styles.sidebar}>
          <div className={styles.scrollArea}>
            <ul className={styles.list}>
              {sections.map(({ route, icon: Icon }) => (
                <li key={route} className={styles.navLink}>
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{product(`navigation.${route}`)}</span>
                </li>
              ))}
            </ul>
            <div className={styles.channelSection}>
              <div className={styles.sectionHeading}>
                {product('concepts.channels')}
              </div>
              <ul className={styles.list}>
                {channels.map(channel => (
                  <li
                    key={channel}
                    className={styles.navLink}
                    aria-current={channel === 'general' ? 'page' : undefined}
                  >
                    <Hash size={17} strokeWidth={1.8} />
                    <span>{channel}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.profile}>
            <div className={styles.trigger}>
              <span className={styles.profileAvatar}>IH</span>
              <span className={styles.profileIdentity}>
                <strong>{product('preview.people.ihor')}</strong>
                <span className={styles.status}>
                  <i />
                  {user('profile.online')}
                </span>
              </span>
              <ChevronUp size={16} className={styles.chevron} />
            </div>
          </div>
        </aside>

        {/* ==================== CHANNEL ==================== */}

        <div className={styles.channel}>
          <div className={styles.channelHeader}>
            <Hash size={18} />
            <span>general</span>
          </div>
          <div className={styles.scroller}>
            <ul className={styles.messages}>
              {messages.map(({ person, initials, time, content }) => (
                <li key={person} className={styles.message}>
                  <span className={styles.avatar}>{initials}</span>
                  <div>
                    <div className={styles.meta}>
                      <strong>{product(`preview.people.${person}`)}</strong>
                      <span>{time}</span>
                    </div>
                    <p>{product(`preview.messages.${content}`)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.composer}>
            <div className={styles.input}>
              {product('preview.messagePlaceholder')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
