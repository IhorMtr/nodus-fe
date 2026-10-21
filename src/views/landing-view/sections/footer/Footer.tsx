import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';

import { LocaleLinks } from '../../components/LocaleLinks';

import styles from './Footer.module.scss';

export function Footer() {
  const product = useTranslations('product');
  const navigation = useTranslations('navigation');
  const user = useTranslations('user');

  return (
    <footer className={styles.root}>
      <Link href="/" className={styles.brand}>
        {product('name')}
      </Link>
      <nav className={styles.navigation} aria-label={navigation('footerLabel')}>
        <Link href={{ pathname: '/', hash: 'product' }}>
          {navigation('product')}
        </Link>
        <Link href={{ pathname: '/', hash: 'features' }}>
          {navigation('features')}
        </Link>
        <Link
          href={{ pathname: '/', hash: 'product' }}
          title={user('actions.signInPreview')}
        >
          {user('actions.signIn')}
        </Link>
      </nav>
      <LocaleLinks />
      <p className={styles.copyright}>{product('copyright', { year: 2026 })}</p>
    </footer>
  );
}
