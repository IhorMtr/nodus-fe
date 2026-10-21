'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';
import { Button, type ButtonProps } from '@/shared/ui/button';

type ProductActionLinkProps = {
  action?: 'getStarted' | 'signIn';
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
};

export function ProductActionLink({
  action = 'getStarted',
  variant = 'primary',
  size = 'md',
}: ProductActionLinkProps) {
  const product = useTranslations('product');
  const user = useTranslations('user');
  const label =
    action === 'signIn'
      ? user('actions.signIn')
      : product('actions.getStarted');

  return (
    <Button
      variant={variant}
      size={size}
      renderRoot={props => (
        <Link
          {...props}
          type={undefined}
          href={action === 'signIn' ? '/auth/login' : '/auth/register'}
        />
      )}
    >
      {label}
    </Button>
  );
}
