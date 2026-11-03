import { useTranslations } from 'next-intl';

import { productVisuals } from '@/shared/assets/product-visuals';

import { ProductVisual } from '../../components/ProductVisual';

import styles from './OverviewSection.module.scss';

const points = ['metrics', 'channels', 'announcements', 'presence'] as const;

export function OverviewSection() {
  const overview = useTranslations('product.overview');

  return (
    <section
      id="features"
      className={styles.root}
      aria-labelledby="overview-title"
    >
      <div className={styles.inner}>
        {/* ==================== COPY ==================== */}

        <div className={styles.copy}>
          <p className={styles.eyebrow}>{overview('eyebrow')}</p>
          <h2 id="overview-title">{overview('title')}</h2>
          <p className={styles.description}>{overview('description')}</p>

          <ul className={styles.points}>
            {points.map(point => (
              <li key={point}>{overview(`points.${point}`)}</li>
            ))}
          </ul>
        </div>

        {/* ==================== PRODUCT VISUAL ==================== */}

        <div className={styles.visual}>
          <ProductVisual
            source={productVisuals.workspaceOverview}
            alt={overview('visualAlt')}
            sizes="(min-width: 1424px) 880px, (min-width: 1024px) 62vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
