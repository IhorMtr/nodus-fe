import { useTranslations } from 'next-intl';

import { CapabilityMedia } from './CapabilityMedia';
import styles from './CapabilitiesSection.module.scss';

const capabilities = ['organization', 'realtime', 'visibility'] as const;

export function CapabilitiesSection() {
  const t = useTranslations('product');

  return (
    <section className={styles.section} id="features">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{t('capabilities.eyebrow')}</p>
        <h2>{t('capabilities.title')}</h2>
      </div>

      <div className={styles.showcases}>
        {capabilities.map((capability, index) => (
          <article className={styles.showcase} key={capability}>
            <div className={styles.copy}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{t(`capabilities.${capability}.title`)}</h3>
              <p>{t(`capabilities.${capability}.description`)}</p>
            </div>

            <CapabilityMedia capability={capability} />
          </article>
        ))}
      </div>
    </section>
  );
}
