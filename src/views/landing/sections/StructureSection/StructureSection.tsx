import { Hash } from 'lucide-react';
import { useTranslations } from 'next-intl';

import styles from './StructureSection.module.scss';

export function StructureSection() {
  const product = useTranslations('product');

  return (
    <section className={styles.root}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{product('structure.eyebrow')}</p>
        <h2>{product('structure.title')}</h2>
        <p className={styles.description}>{product('structure.description')}</p>
      </div>
      <div className={styles.hierarchy} aria-hidden="true">
        <div>
          <div className={styles.workspace}>
            <span className={styles.mark}>N</span>
            <div>
              <span className={styles.label}>
                {product('structure.workspace')}
              </span>
              <p>{product('preview.workspaceName')}</p>
            </div>
          </div>
          <ul className={styles.channels}>
            {['general', 'frontend', 'backend', 'announcements'].map(
              channel => (
                <li key={channel}>
                  <Hash size={16} strokeWidth={1.5} />
                  <span>{channel}</span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
