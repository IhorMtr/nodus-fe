'use client';

import { Modal } from '@mantine/core';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useRouter } from '@/shared/i18n/navigation';

import { PersonalSettingsView } from './PersonalSettingsView';
import styles from './PersonalSettingsView.module.scss';

// ==================== ROUTE DIALOG ====================

export function PersonalSettingsModal({
  workspaceId,
}: {
  workspaceId: string;
}) {
  // ==================== CONTEXT ====================

  const t = useTranslations('user.settings');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isSettingsRoute =
    pathname === `/${locale}/workspaces/${workspaceId}/personal-settings`;

  // ==================== FOCUS RESTORATION ====================

  // The dialog disappears on Back or when its route unmounts. Restore focus
  // to the visible shell trigger, including when the mobile sidebar is closed.
  useEffect(() => {
    if (!isSettingsRoute) {
      return;
    }

    return () => {
      window.requestAnimationFrame(() => {
        if (
          document.activeElement !== document.body ||
          document.querySelector('[role="dialog"][aria-modal="true"]')
        ) {
          return;
        }

        const triggers = document.querySelectorAll<HTMLButtonElement>(
          '[data-settings-return-focus]'
        );
        const visibleTrigger = Array.from(triggers).find(
          trigger => trigger.getClientRects().length > 0
        );

        visibleTrigger?.focus({ preventScroll: true });
      });
    };
  }, [isSettingsRoute]);

  // ==================== CLOSE ====================

  function close() {
    router.back();
  }

  // ==================== RENDER ====================

  // Parallel routes retain their active slot during soft navigation. Hide the
  // intercepted page when the URL leaves settings, including Back and Forward.
  if (!isSettingsRoute) {
    return null;
  }

  return (
    <Modal
      opened
      onClose={close}
      title={t('title')}
      closeButtonProps={{ 'aria-label': t('close') }}
      centered
      size="min(920px, calc(100vw - 32px))"
      classNames={{
        inner: styles.modalInner,
        content: styles.modalContent,
        body: styles.modalBody,
      }}
    >
      <PersonalSettingsView />
    </Modal>
  );
}
