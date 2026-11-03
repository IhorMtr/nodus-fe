import { useTranslations } from 'next-intl';

import { productVisuals } from '@/shared/assets/product-visuals';

import { ProductVisual } from '../../components/ProductVisual';

import styles from './ChannelsSection.module.scss';

const points = ['topics', 'navigation', 'appearance'] as const;

export function ChannelsSection() {
  const channels = useTranslations('product.channels');

  return (
    <section className={styles.root} aria-labelledby="channels-title">
      <div className={styles.inner}>
        {/* ==================== HEADING ==================== */}

        <div className={styles.heading}>
          <p className={styles.eyebrow}>{channels('eyebrow')}</p>
          <h2 id="channels-title">{channels('title')}</h2>
          <p className={styles.description}>{channels('description')}</p>
        </div>

        {/* ==================== PRODUCT VISUAL ==================== */}

        <div className={styles.visual}>
          <ProductVisual
            className={styles.image}
            source={productVisuals.channelLight}
            alt={channels('visualAlt')}
            sizes="(min-width: 1264px) 1200px, 100vw"
          />
        </div>

        {/* ==================== CHANNEL POINTS ==================== */}

        <ul className={styles.points}>
          {points.map(point => (
            <li key={point}>
              <h3>{channels(`points.${point}.title`)}</h3>
              <p>{channels(`points.${point}.description`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
