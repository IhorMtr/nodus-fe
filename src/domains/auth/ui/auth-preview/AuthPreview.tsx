import Image from 'next/image';

import type { ProductVisualSource } from '@/shared/assets/product-visuals';

import styles from './AuthPreview.module.scss';

// ==================== TYPES ====================

type PreviewVisual = {
  source: ProductVisualSource;
  alt: string;
};

type AuthPreviewProps = {
  title: string;
  description: string;
  visuals: {
    dark: PreviewVisual;
    light: PreviewVisual;
  };
};

// ==================== RENDER ====================

export function AuthPreview({ title, description, visuals }: AuthPreviewProps) {
  return (
    <div className={styles.root}>
      <div className={styles.caption}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className={styles.media}>
        <Image
          className={styles.darkVisual}
          src={visuals.dark.source.src}
          width={visuals.dark.source.width}
          height={visuals.dark.source.height}
          alt={visuals.dark.alt}
          sizes="(min-width: 1024px) 50vw, 100vw"
          unoptimized
        />
        <Image
          className={styles.lightVisual}
          src={visuals.light.source.src}
          width={visuals.light.source.width}
          height={visuals.light.source.height}
          alt={visuals.light.alt}
          sizes="(min-width: 1024px) 50vw, 100vw"
          unoptimized
        />
      </div>
    </div>
  );
}
