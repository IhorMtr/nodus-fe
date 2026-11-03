import {
  Bell,
  ChevronsUpDown,
  Hash,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  PanelRightClose,
  Search,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import styles from './WorkspacePreview.module.scss';

// ==================== CONTENT ====================

// A static, decorative miniature of the workspace shell. It is not a
// screenshot and holds no live data; every label comes from translations.

const sections = [
  { route: 'overview', icon: LayoutDashboard },
  { route: 'conversations', icon: MessagesSquare },
  { route: 'announcements', icon: Megaphone },
] as const;

const channels = [
  { name: 'general', unread: 0 },
  { name: 'frontend', unread: 3 },
  { name: 'backend', unread: 0 },
  { name: 'announcements', unread: 0 },
] as const;

const messages = [
  { person: 'ihor', initials: 'IH', time: '10:42', content: 'contract' },
  { person: 'anna', initials: 'AN', time: '10:44', content: 'review' },
  { person: 'oleh', initials: 'OL', time: '10:46', content: 'nextStep' },
] as const;

const members = [
  { person: 'anna', initials: 'AN', status: 'online' },
  { person: 'ihor', initials: 'IH', status: 'online' },
  { person: 'oleh', initials: 'OL', status: 'away' },
] as const;

// ==================== RENDER ====================

export function WorkspacePreview() {
  const product = useTranslations('product');
  const user = useTranslations('user');
  const roles = useTranslations('invite.roles');
  const panel = useTranslations('workspace.membersPanel');

  return (
    <div className={styles.root} aria-hidden="true">
      {/* ==================== SIDEBAR ==================== */}

      <div className={styles.sidebar}>
        <div className={styles.brand}>{product('name')}</div>

        <div className={styles.switcher}>
          <span className={styles.monogram}>N</span>
          <span className={styles.switcherText}>
            <strong>{product('preview.workspaceName')}</strong>
            <span>{roles('Owner')}</span>
          </span>
          <ChevronsUpDown className={styles.muted} />
        </div>

        <ul className={styles.navList}>
          {sections.map(({ route, icon: Icon }) => (
            <li key={route} className={styles.navItem}>
              <Icon />
              <span>{product(`navigation.${route}`)}</span>
            </li>
          ))}
        </ul>

        <div className={styles.sectionLabel}>
          {product('concepts.channels')}
        </div>
        <ul className={styles.navList}>
          {channels.map(channel => (
            <li
              key={channel.name}
              className={styles.navItem}
              data-active={channel.name === 'general' || undefined}
              data-unread={channel.unread > 0 || undefined}
            >
              <Hash />
              <span>{channel.name}</span>
              {channel.unread > 0 && (
                <span className={styles.badge}>{channel.unread}</span>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.profile}>
          <span className={styles.avatar}>
            IH
            <i className={styles.dot} data-status="online" />
          </span>
          <span className={styles.profileText}>
            <strong>{product('preview.people.ihor')}</strong>
            <span>{user('profile.online')}</span>
          </span>
        </div>
      </div>

      {/* ==================== FRAME ==================== */}

      <div className={styles.frame}>
        <div className={styles.header}>
          <Hash className={styles.muted} />
          <strong>general</strong>
          <span className={styles.headerActions}>
            <Search />
            <Bell />
            <PanelRightClose />
          </span>
        </div>

        <div className={styles.body}>
          {/* ==================== MESSAGES ==================== */}

          <div className={styles.channel}>
            <div className={styles.messages}>
              <div className={styles.dayDivider}>
                {product('preview.today')}
              </div>
              {messages.map(message => (
                <div key={message.person} className={styles.message}>
                  <span className={styles.avatar}>{message.initials}</span>
                  <div>
                    <div className={styles.meta}>
                      <strong>
                        {product(`preview.people.${message.person}`)}
                      </strong>
                      <span>{message.time}</span>
                    </div>
                    <p>{product(`preview.messages.${message.content}`)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.composer}>
              {product('preview.messagePlaceholder')}
            </div>
          </div>

          {/* ==================== MEMBERS ==================== */}

          <div className={styles.members}>
            <div className={styles.membersHeading}>
              <strong>{panel('title')}</strong>
              <span className={styles.count}>{members.length}</span>
            </div>
            <div className={styles.sectionLabel}>
              {panel('online', { count: members.length })}
            </div>
            {members.map(member => (
              <div key={member.person} className={styles.member}>
                <span className={styles.avatar}>
                  {member.initials}
                  <i className={styles.dot} data-status={member.status} />
                </span>
                <span>{product(`preview.people.${member.person}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
