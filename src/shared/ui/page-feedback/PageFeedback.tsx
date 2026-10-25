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
  return (
    <main className={`${styles.page} ${contained ? styles.contained : ''}`}>
      <div className={styles.content}>
        <h1>{title}</h1>
        {description && <p role="status">{description}</p>}
        {onAction && actionLabel && (
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </main>
  );
}

export function PageSpinner({
  label,
  contained = false,
}: {
  label: string;
  contained?: boolean;
}) {
  return (
    <main className={`${styles.page} ${contained ? styles.contained : ''}`}>
      <Spinner label={label} />
    </main>
  );
}
