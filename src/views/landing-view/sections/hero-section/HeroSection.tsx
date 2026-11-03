import { useTranslations } from 'next-intl';

import { productVisuals } from '@/shared/assets/product-visuals';

import { ProductActionLink } from '../../components/ProductActionLink';
import { ProductVisual } from '../../components/ProductVisual';

import styles from './HeroSection.module.scss';

export function HeroSection() {
  const hero = useTranslations('product.hero');

  return (
    <section className={styles.root} aria-labelledby="hero-title">
      {/* ==================== HEADLINE ==================== */}

      <div className={styles.headline}>
        <div className={styles.title}>
          <p className={styles.eyebrow}>{hero('eyebrow')}</p>
          <h1 id="hero-title">{hero('title')}</h1>
        </div>

        <div className={styles.summary}>
          <p className={styles.description}>{hero('description')}</p>
          <div className={styles.actions}>
            <ProductActionLink size="lg" />
            <ProductActionLink action="signIn" variant="secondary" size="lg" />
          </div>
        </div>
      </div>

      {/* ==================== PRODUCT VISUAL ==================== */}

      <div className={styles.stage}>
        <div className={styles.visual}>
          <ProductVisual
            source={productVisuals.heroChannel}
            alt={hero('visualAlt')}
            sizes="(min-width: 1424px) 1360px, 100vw"
            preload
          />
        </div>
      </div>
    </section>
  );
}
