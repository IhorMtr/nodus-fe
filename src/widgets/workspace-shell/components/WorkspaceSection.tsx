import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import styles from './WorkspaceSection.module.scss';

// ==================== TYPES ====================

interface WorkspaceSectionProps {
  section: 'overview' | 'conversations' | 'announcements' | 'search';
  icon: ReactNode;
}

// ==================== RENDER ====================

// Placeholder for sections that are not implemented yet. The shell header
// already names the section, so the page shows only an empty state.
export function WorkspaceSection({ section, icon }: WorkspaceSectionProps) {
  const t = useTranslations('workspace');

  return (
    <div className={styles.page}>
      <div className={styles.empty}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <h1>{t(`navigation.${section}`)}</h1>
        <p>{t(`sections.${section}Pending`)}</p>
      </div>
    </div>
  );
}
