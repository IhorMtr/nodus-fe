import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import styles from './WorkspaceSection.module.scss';

export function WorkspaceSection({
  section,
  icon,
}: {
  section: 'overview' | 'conversations' | 'announcements' | 'search';
  icon: ReactNode;
}) {
  const t = useTranslations('workspace');

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span aria-hidden="true">{icon}</span>
        <h1>{t(`navigation.${section}`)}</h1>
      </header>
      <div className={styles.empty}>
        <p>{t(`sections.${section}Pending`)}</p>
      </div>
    </main>
  );
}
