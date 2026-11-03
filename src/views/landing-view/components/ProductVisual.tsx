import Image from 'next/image';

import type { ProductVisualSource } from '@/shared/assets/product-visuals';

import styles from './ProductVisual.module.scss';

// ==================== TYPES ====================

type ProductVisualProps = {
  source: ProductVisualSource;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
};

// ==================== RENDER ====================

export function ProductVisual({
  source,
  alt,
  sizes,
  preload = false,
  className,
}: ProductVisualProps) {
  const classNames = className ? `${styles.root} ${className}` : styles.root;

  return (
    <Image
      className={classNames}
      src={source.src}
      width={source.width}
      height={source.height}
      alt={alt}
      sizes={sizes}
      unoptimized
      preload={preload}
    />
  );
}
