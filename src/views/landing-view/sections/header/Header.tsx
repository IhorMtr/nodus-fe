import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';

import { LocaleSelector } from '../../components/LocaleSelector';
import { ProductActionLink } from '../../components/ProductActionLink';
import { landingSections } from '../../landing-sections';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';

import styles from './Header.module.scss';

export function Header() {
  const product = useTranslations('product');
  const navigation = useTranslations('navigation');

  return (
    <header className={styles.root}>
      <div className={styles.bar}>
        {/* ==================== BRAND ==================== */}

        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            N
          </span>
          {product('name')}
        </Link>

        {/* ==================== NAVIGATION ==================== */}

        <nav
          className={styles.navigation}
          aria-label={navigation('primaryLabel')}
        >
          {landingSections.map(section => (
            <Link key={section.id} href={{ pathname: '/', hash: section.id }}>
              {navigation(section.label)}
            </Link>
          ))}
        </nav>

        {/* ==================== ACTIONS ==================== */}

        <div className={styles.controls}>
          <div className={styles.preferences}>
            <LocaleSelector />
            <ThemeToggle />
          </div>
          <div className={styles.signIn}>
            <ProductActionLink action="signIn" variant="ghost" size="sm" />
          </div>
          <ProductActionLink size="sm" />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
