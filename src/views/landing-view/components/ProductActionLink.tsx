'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n/navigation';
import { Button, type ButtonProps } from '@/shared/ui/button';

// ==================== TYPES ====================

type ProductAction = 'getStarted' | 'createWorkspace' | 'signIn';

type ProductActionLinkProps = {
  action?: ProductAction;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  fullWidth?: boolean;
  onClick?: () => void;
};

// ==================== ROUTES ====================

const actionRoutes = {
  getStarted: '/auth/register',
  createWorkspace: '/auth/register',
  signIn: '/auth/login',
} as const;

// ==================== RENDER ====================

export function ProductActionLink({
  action = 'getStarted',
  variant = 'primary',
  size = 'md',
  fullWidth,
  onClick,
}: ProductActionLinkProps) {
  const product = useTranslations('product.actions');
  const user = useTranslations('user.actions');
  const label = action === 'signIn' ? user('signIn') : product(action);

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      renderRoot={props => (
        <Link {...props} type={undefined} href={actionRoutes[action]} />
      )}
    >
      {label}
    </Button>
  );
}
