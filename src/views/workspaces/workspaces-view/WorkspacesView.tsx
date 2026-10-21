'use client';

import { useTranslations } from 'next-intl';

import { useRouter } from '@/shared/i18n/navigation';
import { PageFeedback } from '@/shared/ui/page-feedback';

export function WorkspacesView() {
  const t = useTranslations('workspace');
  const router = useRouter();

  return (
    <PageFeedback
      title={t('states.managementPending')}
      actionLabel={t('actions.openAvailable')}
      onAction={() => router.replace('/app')}
    />
  );
}
