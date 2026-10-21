import { Clock3, Megaphone, Pin, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import styles from './CapabilityMedia.module.scss';

type CapabilityMediaProps = {
  capability: 'organization' | 'realtime' | 'visibility';
};

// ==================== CONTENT ====================

const channels = ['general', 'frontend', 'backend', 'announcements'];

export function CapabilityMedia({ capability }: CapabilityMediaProps) {
  // ==================== TRANSLATIONS ====================

  const t = useTranslations('product');
  const presence = useTranslations('presence');

  return (
    <div className={styles.frame} aria-hidden="true">
      <div className={styles.mock}>
        {capability === 'organization' && (
          <div className={styles.workspace}>
            <div className={styles.applicationBar}>
              <strong>{t('name')}</strong>
              <span>{t('preview.workspaceName')}</span>
            </div>
            <div className={styles.channelList}>
              <div className={styles.workspaceNavigation}>
                <span>{t('navigation.overview')}</span>
                <strong>{t('navigation.conversations')}</strong>
              </div>
              <span className={styles.listLabel}>{t('concepts.channels')}</span>
              <div className={styles.channels}>
                {channels.map((channel, index) => (
                  <div
                    className={
                      index === 0 ? styles.selectedChannel : styles.channel
                    }
                    key={channel}
                  >
                    <span className={styles.hash}>#</span>
                    {channel}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {capability === 'realtime' && (
          <div className={styles.conversation}>
            <div className={styles.conversationHeader}>
              <strong>
                <span className={styles.hash}>#</span> general
              </strong>
              <span className={styles.presence}>
                <span className={styles.presenceDot} />
                {presence('online', { count: 3 })}
              </span>
            </div>
            <div className={styles.messages}>
              <div className={styles.message}>
                <span className={styles.avatar}>IH</span>
                <div>
                  <div className={styles.messageMeta}>
                    <strong>{t('preview.people.ihor')}</strong>
                    <span>10:42</span>
                  </div>
                  <p>{t('capabilities.realtime.media.message')}</p>
                </div>
              </div>
              <div className={styles.message}>
                <span className={styles.avatar}>AN</span>
                <div>
                  <div className={styles.messageMeta}>
                    <strong>{t('preview.people.anna')}</strong>
                    <span>10:44</span>
                  </div>
                  <p>{t('capabilities.realtime.media.reply')}</p>
                </div>
              </div>
            </div>
            <div className={styles.typing}>
              <span className={styles.typingDots}>
                <i />
                <i />
                <i />
              </span>
              {t('capabilities.realtime.media.typing')}
            </div>
          </div>
        )}

        {capability === 'visibility' && (
          <div className={styles.updates}>
            <div className={styles.search}>
              <Search size={16} />
              <span>{t('capabilities.visibility.media.search')}</span>
            </div>
            <div className={styles.announcement}>
              <span className={styles.announcementIcon}>
                <Megaphone size={20} />
              </span>
              <strong>{t('capabilities.visibility.media.announcement')}</strong>
              <span className={styles.schedule}>
                <Clock3 size={13} />
                {t('capabilities.visibility.media.scheduled')}
              </span>
              <p>{t('capabilities.visibility.media.message')}</p>
              <div className={styles.pinned}>
                <Pin size={13} />
                {t('capabilities.visibility.media.pinned')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
