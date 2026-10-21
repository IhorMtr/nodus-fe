'use client';

import { ActionIcon, type ActionIconProps } from '@mantine/core';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import styles from './IconButton.module.scss';

// ==================== TYPES ====================

type AccessibleName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

type IconButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'color' | 'aria-label' | 'aria-labelledby'
> &
  Pick<ActionIconProps, 'loading'> &
  AccessibleName & {
    icon: ReactNode;
    variant?: 'default' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  };

// ==================== VARIANTS ====================

const variants = {
  default: 'default',
  ghost: 'subtle',
  danger: 'light',
} as const;

// ==================== COMPONENT ====================

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  loading,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <ActionIcon
      {...props}
      type={type}
      variant={variants[variant]}
      size={size}
      data-variant={variant}
      data-size={size}
      loading={loading}
      aria-busy={loading || props['aria-busy']}
      loaderProps={{ color: 'currentColor', size: 'var(--control-icon-size)' }}
      classNames={{
        root: styles.root,
        icon: styles.icon,
        loader: styles.loader,
      }}
    >
      <span className={styles.glyph} aria-hidden="true">
        {icon}
      </span>
    </ActionIcon>
  );
}
