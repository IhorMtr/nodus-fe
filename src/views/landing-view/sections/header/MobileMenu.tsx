'use client';

import { useDisclosure, useWindowEvent } from '@mantine/hooks';
import { Menu as MenuIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useRef } from 'react';

import { Link } from '@/shared/i18n/navigation';
import { IconButton } from '@/shared/ui/icon-button';

import { LocaleSelector } from '../../components/LocaleSelector';
import { ProductActionLink } from '../../components/ProductActionLink';
import { landingSections } from '../../landing-sections';
import { ThemeToggle } from './ThemeToggle';

import styles from './MobileMenu.module.scss';

export function MobileMenu() {
  const navigation = useTranslations('navigation');
  const [opened, { toggle, close }] = useDisclosure(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // ==================== INTERACTIONS ====================

  useWindowEvent('pointerdown', event => {
    if (!opened || !(event.target instanceof Element)) {
      return;
    }

    if (
      rootRef.current?.contains(event.target) ||
      event.target.closest('.mantine-Menu-dropdown')
    ) {
      return;
    }

    close();
  });

  useWindowEvent('keydown', event => {
    if (!opened || event.key !== 'Escape') {
      return;
    }

    close();
    toggleRef.current?.focus();
  });

  // ==================== RENDER ====================

  return (
    <div ref={rootRef} className={styles.root}>
      <IconButton
        ref={toggleRef}
        size="sm"
        variant="ghost"
        icon={opened ? <X /> : <MenuIcon />}
        aria-label={navigation(opened ? 'closeMenu' : 'openMenu')}
        aria-expanded={opened}
        aria-controls={panelId}
        onClick={toggle}
      />

      <div id={panelId} className={styles.panel} hidden={!opened}>
        <nav aria-label={navigation('primaryLabel')}>
          <ul className={styles.links}>
            {landingSections.map(section => (
              <li key={section.id}>
                <Link
                  href={{ pathname: '/', hash: section.id }}
                  onClick={close}
                >
                  {navigation(section.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.preferences}>
          <LocaleSelector />
          <ThemeToggle />
        </div>

        <div className={styles.account}>
          <ProductActionLink
            action="signIn"
            variant="secondary"
            fullWidth
            onClick={close}
          />
        </div>
      </div>
    </div>
  );
}
