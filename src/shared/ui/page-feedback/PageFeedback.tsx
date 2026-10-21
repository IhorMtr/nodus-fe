'use client';

import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import styles from './PageFeedback.module.scss';

type PageFeedbackProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function PageFeedback({
  title,
  description,
  actionLabel,
  onAction,
}: PageFeedbackProps) {
  return (
    <main className={styles.page}>
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

export function PageSpinner({ label }: { label: string }) {
  return (
    <main className={styles.page}>
      <Spinner label={label} />
    </main>
  );
}
