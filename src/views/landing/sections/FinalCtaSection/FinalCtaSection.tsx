import { useTranslations } from 'next-intl';

import { ProductActionLink } from '../../components/ProductActionLink';

import styles from './FinalCtaSection.module.scss';

export function FinalCtaSection() {
  const product = useTranslations('product');

  return (
    <section className={styles.root}>
      <div>
        <h2>{product('invitation.title')}</h2>
        <p>{product('invitation.description')}</p>
      </div>
      <ProductActionLink />
    </section>
  );
}
