'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';
import { Button, type ButtonProps } from '@/shared/ui/Button';

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
  const description =
    action === 'signIn'
      ? user('actions.signInPreview')
      : product('actions.getStartedPreview');

  return (
    <Button
      variant={variant}
      size={size}
      title={description}
      renderRoot={props => (
        <Link
          {...props}
          type={undefined}
          href={{ pathname: '/', hash: 'product' }}
        />
      )}
    >
      {label}
    </Button>
  );
}
