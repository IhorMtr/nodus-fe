import { useTranslations } from 'next-intl';

import { ProductActionLink } from '../../components/ProductActionLink';

import styles from './HeroSection.module.scss';

export function HeroSection() {
  const product = useTranslations('product');

  return (
    <section className={styles.root}>
      <div className={styles.media} />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{product('name')}</p>
          <h1>{product('tagline')}</h1>
          <p className={styles.description}>{product('description')}</p>
          <div className={styles.actions}>
            <ProductActionLink />
            <ProductActionLink action="signIn" variant="secondary" />
          </div>
          <p className={styles.availability}>
            {product('actions.previewAvailability')}
          </p>
        </div>
        <div className={styles.visualSpace} aria-hidden="true">
          <p className={styles.category}>{product('category')}</p>
          <div className={styles.concepts}>
            {(['workspaces', 'channels', 'conversations'] as const).map(
              (concept, index) => (
                <div className={styles.concept} key={concept}>
                  <span className={styles.number}>0{index + 1}</span>
                  <span>{product(`concepts.${concept}`)}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
