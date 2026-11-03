import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';

import { LocaleLinks } from '../../components/LocaleLinks';
import { landingSections } from '../../landing-sections';

import styles from './Footer.module.scss';

export function Footer() {
  const product = useTranslations('product');
  const navigation = useTranslations('navigation');
  const user = useTranslations('user.actions');

  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        {/* ==================== BRAND ==================== */}

        <div className={styles.brandColumn}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              N
            </span>
            {product('name')}
          </Link>
          <p className={styles.description}>{product('description')}</p>
        </div>

        {/* ==================== NAVIGATION ==================== */}

        <nav
          className={styles.navigation}
          aria-label={navigation('footerLabel')}
        >
          <div className={styles.group}>
            <h2>{product('footer.product')}</h2>
            <ul>
              {landingSections.map(section => (
                <li key={section.id}>
                  <Link href={{ pathname: '/', hash: section.id }}>
                    {navigation(section.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.group}>
            <h2>{product('footer.account')}</h2>
            <ul>
              <li>
                <Link href="/auth/login">{user('signIn')}</Link>
              </li>
              <li>
                <Link href="/auth/register">{user('createAccount')}</Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* ==================== META ==================== */}

        <div className={styles.meta}>
          <p className={styles.copyright}>
            {product('copyright', { year: new Date().getFullYear() })}
          </p>
          <LocaleLinks />
        </div>
      </div>
    </footer>
  );
}
