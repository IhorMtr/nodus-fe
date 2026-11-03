import { useTranslations } from 'next-intl';

import { productVisuals } from '@/shared/assets/product-visuals';

import { ProductVisual } from '../../components/ProductVisual';

import styles from './UpdatesSection.module.scss';

export function UpdatesSection() {
  const updates = useTranslations('product.updates');

  return (
    <section
      id="updates"
      className={styles.root}
      aria-labelledby="updates-title"
    >
      <div className={styles.inner}>
        {/* ==================== HEADING ==================== */}

        <div className={styles.heading}>
          <p className={styles.eyebrow}>{updates('eyebrow')}</p>
          <h2 id="updates-title">{updates('title')}</h2>
        </div>

        <div className={styles.features}>
          {/* ==================== ANNOUNCEMENTS ==================== */}

          <article className={styles.feature}>
            <ProductVisual
              source={productVisuals.announcements}
              alt={updates('announcements.visualAlt')}
              sizes="(min-width: 1264px) 680px, (min-width: 768px) 56vw, 100vw"
            />
            <div className={styles.copy}>
              <h3>{updates('announcements.title')}</h3>
              <p>{updates('announcements.description')}</p>
            </div>
          </article>

          {/* ==================== NOTIFICATIONS ==================== */}

          {/* The crop shows half the source width, hence the doubled sizes. */}
          <article className={styles.feature}>
            <ProductVisual
              className={styles.notifications}
              source={productVisuals.notifications}
              alt={updates('notifications.visualAlt')}
              sizes="(min-width: 1264px) 940px, (min-width: 768px) 78vw, 200vw"
            />
            <div className={styles.copy}>
              <h3>{updates('notifications.title')}</h3>
              <p>{updates('notifications.description')}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
