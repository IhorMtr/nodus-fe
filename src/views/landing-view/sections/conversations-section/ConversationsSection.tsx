import { useTranslations } from 'next-intl';

import { productVisuals } from '@/shared/assets/product-visuals';

import { ProductVisual } from '../../components/ProductVisual';

import styles from './ConversationsSection.module.scss';

const details = ['realtime', 'receipts', 'presence', 'history'] as const;

export function ConversationsSection() {
  const conversations = useTranslations('product.conversations');

  return (
    <section className={styles.root} aria-labelledby="conversations-title">
      <div className={styles.inner}>
        {/* ==================== COPY ==================== */}

        <div className={styles.copy}>
          <p className={styles.eyebrow}>{conversations('eyebrow')}</p>
          <h2 id="conversations-title">{conversations('title')}</h2>
          <p className={styles.description}>{conversations('description')}</p>

          <dl className={styles.details}>
            {details.map(detail => (
              <div key={detail}>
                <dt>{conversations(`details.${detail}.term`)}</dt>
                <dd>{conversations(`details.${detail}.description`)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ==================== PRODUCT VISUAL ==================== */}

        <div className={styles.visual}>
          <ProductVisual
            source={productVisuals.directConversation}
            alt={conversations('visualAlt')}
            sizes="(min-width: 1264px) 660px, (min-width: 1024px) 55vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
