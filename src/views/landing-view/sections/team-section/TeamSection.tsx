import { useTranslations } from 'next-intl';

import { productVisuals } from '@/shared/assets/product-visuals';

import { ProductVisual } from '../../components/ProductVisual';

import styles from './TeamSection.module.scss';

const facts = ['roles', 'invitations', 'presence', 'access'] as const;

export function TeamSection() {
  const team = useTranslations('product.team');

  return (
    <section id="team" className={styles.root} aria-labelledby="team-title">
      <div className={styles.inner}>
        {/* ==================== HEADING ==================== */}

        <div className={styles.heading}>
          <div className={styles.statement}>
            <p className={styles.eyebrow}>{team('eyebrow')}</p>
            <h2 id="team-title">{team('title')}</h2>
            <p className={styles.description}>{team('description')}</p>
          </div>

          <ul className={styles.facts}>
            {facts.map(fact => (
              <li key={fact}>
                <h3>{team(`facts.${fact}.title`)}</h3>
                <p>{team(`facts.${fact}.description`)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ==================== PRODUCT VISUAL ==================== */}

        <div className={styles.visual}>
          <ProductVisual
            source={productVisuals.members}
            alt={team('visualAlt')}
            sizes="(min-width: 1264px) 1200px, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
