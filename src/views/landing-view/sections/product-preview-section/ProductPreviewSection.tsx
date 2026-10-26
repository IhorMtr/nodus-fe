import { useTranslations } from 'next-intl';

import { AppPreview } from '@/widgets/app-preview/AppPreview';

import styles from './ProductPreviewSection.module.scss';

export function ProductPreviewSection() {
  const product = useTranslations('product');

  return (
    <section id="product" className={styles.root}>
      <div className={styles.introduction}>
        <p className={styles.eyebrow}>{product('preview.eyebrow')}</p>
        <h2>{product('preview.title')}</h2>
        <p className={styles.description}>{product('preview.description')}</p>
      </div>

      <div className={styles.mediaFrame}>
        <AppPreview />
      </div>
    </section>
  );
}
