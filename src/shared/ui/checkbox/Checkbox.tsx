'use client';

import {
  Checkbox as MantineCheckbox,
  type CheckboxProps as MantineCheckboxProps,
} from '@mantine/core';
import { Check, Minus } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';

import styles from './Checkbox.module.scss';

// ==================== TYPES ====================

export type CheckboxProps = Omit<
  ComponentPropsWithRef<'input'>,
  'children' | 'color' | 'size' | 'style' | 'type'
> &
  Pick<
    MantineCheckboxProps,
    'label' | 'description' | 'error' | 'indeterminate'
  > & {
    size?: 'sm' | 'md' | 'lg';
  };

// ==================== ICON ====================

const CheckboxIcon: NonNullable<MantineCheckboxProps['icon']> = ({
  indeterminate,
  className,
}) => {
  const Icon = indeterminate ? Minus : Check;

  return <Icon className={className} aria-hidden="true" strokeWidth={3} />;
};

// ==================== COMPONENT ====================

export function Checkbox({
  size = 'md',
  error,
  'aria-invalid': ariaInvalid,
  ...props
}: CheckboxProps) {
  return (
    <MantineCheckbox
      {...props}
      size={size}
      error={error}
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      icon={CheckboxIcon}
      classNames={styles}
    />
  );
}
