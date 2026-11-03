import { useTranslations } from 'next-intl';

import styles from './IntroductionSection.module.scss';

const points = ['workspaces', 'conversations', 'announcements'] as const;

export function IntroductionSection() {
  const introduction = useTranslations('product.introduction');

  return (
    <section
      id="product"
      className={styles.root}
      aria-labelledby="introduction-title"
    >
      <div className={styles.inner}>
        {/* ==================== STATEMENT ==================== */}

        <div className={styles.statement}>
          <p className={styles.eyebrow}>{introduction('eyebrow')}</p>
          <h2 id="introduction-title">{introduction('title')}</h2>
        </div>

        {/* ==================== PRODUCT PILLARS ==================== */}

        <div className={styles.details}>
          <p className={styles.description}>{introduction('description')}</p>

          <ol className={styles.points}>
            {points.map((point, index) => (
              <li key={point}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{introduction(`points.${point}.title`)}</h3>
                  <p>{introduction(`points.${point}.description`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
