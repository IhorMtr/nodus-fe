import { useTranslations } from 'next-intl';

import { ProductActionLink } from '../../components/ProductActionLink';

import styles from './FinalCtaSection.module.scss';

export function FinalCtaSection() {
  const invitation = useTranslations('product.invitation');

  return (
    <section className={styles.root} aria-labelledby="invitation-title">
      <div className={styles.inner}>
        <span className={styles.mark} aria-hidden="true">
          N
        </span>
        <h2 id="invitation-title">{invitation('title')}</h2>
        <p className={styles.description}>{invitation('description')}</p>

        <div className={styles.actions}>
          <ProductActionLink action="createWorkspace" size="lg" />
          <ProductActionLink action="signIn" variant="ghost" size="lg" />
        </div>
      </div>
    </section>
  );
}
