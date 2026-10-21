import {
  ArrowUp,
  ChevronDown,
  Hash,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Search,
} from 'lucide-react';
import Image, { type ImageProps } from 'next/image';
import { useTranslations } from 'next-intl';

import styles from './AuthPreview.module.scss';

type AuthPreviewProps = {
  image?: {
    src: ImageProps['src'];
    alt: string;
  };
};

const workspaceNavigation = [
  { label: 'overview', icon: LayoutDashboard },
  { label: 'conversations', icon: MessagesSquare },
  { label: 'announcements', icon: Megaphone },
] as const;

const channels = ['general', 'frontend', 'backend'] as const;

const messages = [
  { person: 'ihor', initials: 'IH', time: '10:42', content: 'contract' },
  { person: 'anna', initials: 'AN', time: '10:44', content: 'review' },
  { person: 'oleh', initials: 'OL', time: '10:46', content: 'nextStep' },
] as const;

export function AuthPreview({ image }: AuthPreviewProps) {
  const auth = useTranslations('auth');
  const product = useTranslations('product');
  const presence = useTranslations('presence');

  return (
    <div className={styles.root}>
      <div className={styles.media}>
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1280px) calc(50vw - 96px), 50vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.application} aria-hidden="true">
            {/* ==================== APPLICATION HEADER ==================== */}

            <div className={styles.applicationHeader}>
              <strong className={styles.brand}>{product('name')}</strong>
              <span className={styles.workspaceName}>
                {product('preview.workspaceName')}
                <ChevronDown size={12} />
              </span>
              <Search size={15} className={styles.searchIcon} />
              <span className={styles.headerAvatar}>IH</span>
            </div>

            <div className={styles.applicationBody}>
              {/* ==================== WORKSPACE NAVIGATION ==================== */}

              <div className={styles.sidebar}>
                <ul className={styles.navigation}>
                  {workspaceNavigation.map(({ label, icon: Icon }) => (
                    <li
                      key={label}
                      className={
                        label === 'conversations'
                          ? styles.activeNavigation
                          : undefined
                      }
                    >
                      <Icon size={14} />
                      <span>{product(`navigation.${label}`)}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.channels}>
                  <span className={styles.groupHeading}>
                    {product('concepts.channels')}
                  </span>
                  <ul className={styles.navigation}>
                    {channels.map(channel => (
                      <li
                        key={channel}
                        className={
                          channel === 'general'
                            ? styles.activeChannel
                            : undefined
                        }
                      >
                        <Hash size={13} />
                        <span>{channel}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.userStatus}>
                  <span className={styles.busyDot} />
                  <span>{presence('doNotDisturb')}</span>
                </div>
              </div>

              {/* ==================== CHANNEL CONTENT ==================== */}

              <div className={styles.conversation}>
                <div className={styles.channelHeader}>
                  <strong>
                    <Hash size={16} />
                    general
                  </strong>
                  <span>{product('preview.channelDescription')}</span>
                </div>
                <div className={styles.messages}>
                  <span className={styles.date}>
                    {product('preview.today')}
                  </span>
                  {messages.map(({ person, initials, time, content }) => (
                    <div key={person} className={styles.message}>
                      <span className={styles.avatar}>{initials}</span>
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
                <div className={styles.composerArea}>
                  <div className={styles.composer}>
                    <span>{product('preview.messagePlaceholder')}</span>
                    <span className={styles.sendIcon}>
                      <ArrowUp size={14} />
                    </span>
                  </div>
                  <span className={styles.presence}>
                    <span className={styles.onlineDot} />
                    {presence('online', { count: 3 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={styles.caption}>
        <h2>{auth('preview.title')}</h2>
        <p>{auth('preview.description')}</p>
      </div>
    </div>
  );
}
