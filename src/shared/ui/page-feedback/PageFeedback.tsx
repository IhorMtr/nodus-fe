'use client';

import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import styles from './PageFeedback.module.scss';

type PageFeedbackProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  contained?: boolean;
};

export function PageFeedback({
  title,
  description,
  actionLabel,
  onAction,
  contained = false,
}: PageFeedbackProps) {
  // ==================== LANDMARK OWNERSHIP ====================

  const Container = contained ? 'div' : 'main';

  // ==================== RENDER ====================

  return (
    <Container
      className={`${styles.page} ${contained ? styles.contained : ''}`}
    >
      <div className={styles.content}>
        <h1>{title}</h1>
        {description && <p role="status">{description}</p>}
        {onAction && actionLabel && (
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Container>
  );
}

export function PageSpinner({
  label,
  contained = false,
}: {
  label: string;
  contained?: boolean;
}) {
  // ==================== LANDMARK OWNERSHIP ====================

  const Container = contained ? 'div' : 'main';

  // ==================== RENDER ====================

  return (
    <Container
      className={`${styles.page} ${contained ? styles.contained : ''}`}
    >
      <Spinner label={label} />
    </Container>
  );
}
