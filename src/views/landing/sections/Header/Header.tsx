import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';

import { LocaleSelector } from '../../components/LocaleSelector';
import { ProductActionLink } from '../../components/ProductActionLink';
import { ThemeToggle } from './ThemeToggle';

import styles from './Header.module.scss';

export function Header() {
  // ==================== TRANSLATIONS ====================

  const product = useTranslations('product');
  const navigation = useTranslations('navigation');

  return (
    <header className={styles.root}>
      <Link href="/" className={styles.brand}>
        {product('name')}
      </Link>
      <nav
        className={styles.navigation}
        aria-label={navigation('primaryLabel')}
      >
        <Link href={{ pathname: '/', hash: 'product' }}>
          {navigation('product')}
        </Link>
        <Link href={{ pathname: '/', hash: 'features' }}>
          {navigation('features')}
        </Link>
      </nav>
      <div className={styles.locale}>
        <LocaleSelector />
      </div>
      <div className={styles.actions}>
        <ProductActionLink action="signIn" variant="ghost" size="sm" />
        <ProductActionLink size="sm" />
      </div>
      <div className={styles.appearance}>
        <ThemeToggle />
      </div>
    </header>
  );
}
