'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';

export function SkipLink({ className }: { className: string }) {
  const navigation = useTranslations('navigation');

  return (
    <Link
      href={{ pathname: '/', hash: 'main-content' }}
      className={className}
      onClick={() =>
        document.getElementById('main-content')?.focus({ preventScroll: true })
      }
    >
      {navigation('skipToContent')}
    </Link>
  );
}
