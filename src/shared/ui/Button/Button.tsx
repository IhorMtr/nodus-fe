'use client';

import {
  Button as MantineButton,
  type ButtonProps as MantineButtonProps,
} from '@mantine/core';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import styles from './Button.module.scss';

// ==================== TYPES ====================

export type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'color'> &
  Pick<MantineButtonProps, 'loading' | 'fullWidth'> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    renderRoot?: (props: ComponentPropsWithRef<'a'>) => ReactNode;
  };

// ==================== VARIANTS ====================

const variants = {
  primary: 'filled',
  secondary: 'default',
  ghost: 'subtle',
  danger: 'light',
} as const;

// ==================== COMPONENT ====================

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <MantineButton
      {...props}
      type={type}
      variant={variants[variant]}
      size={size}
      data-variant={variant}
      data-size={size}
      loading={loading}
      aria-busy={loading || props['aria-busy']}
      loaderProps={{ color: 'currentColor', size: 'var(--control-icon-size)' }}
      leftSection={
        leftIcon ? (
          <span className={styles.icon} aria-hidden="true">
            {leftIcon}
          </span>
        ) : undefined
      }
      rightSection={
        rightIcon ? (
          <span className={styles.icon} aria-hidden="true">
            {rightIcon}
          </span>
        ) : undefined
      }
      classNames={{
        root: styles.root,
        inner: styles.inner,
        section: styles.section,
      }}
    />
  );
}
