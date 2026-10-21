'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import styles from './SessionFeedback.module.scss';

type SessionFeedbackProps = {
  unavailable?: boolean;
  onRetry?: () => void;
  onContinue?: () => void;
};

export function SessionFeedback({
  unavailable = false,
  onRetry,
  onContinue,
}: SessionFeedbackProps) {
  const t = useTranslations('auth.session');

  return (
    <div
      className={`${styles.fullscreen}${unavailable ? ` ${styles.unavailable}` : ''}`}
    >
      {unavailable ? (
        <>
          <p role="alert">{t('unavailable')}</p>
          <Button variant="secondary" onClick={onRetry}>
            {t('retry')}
          </Button>
          {onContinue && (
            <Button variant="secondary" onClick={onContinue}>
              {t('continueToForm')}
            </Button>
          )}
        </>
      ) : (
        <Spinner label={t('loading')} />
      )}
    </div>
  );
}
