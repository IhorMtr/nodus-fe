'use client';

import {
  Switch as MantineSwitch,
  type SwitchProps as MantineSwitchProps,
} from '@mantine/core';
import type { ComponentPropsWithRef } from 'react';

import styles from './Switch.module.scss';

export type SwitchProps = Omit<
  ComponentPropsWithRef<'input'>,
  'children' | 'color' | 'size' | 'style' | 'type'
> &
  Pick<MantineSwitchProps, 'label' | 'description' | 'error'> & {
    size?: 'sm' | 'md' | 'lg';
  };

export function Switch({
  size = 'md',
  error,
  'aria-invalid': ariaInvalid,
  ...props
}: SwitchProps) {
  return (
    <MantineSwitch
      {...props}
      size={size}
      error={error}
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      withThumbIndicator={false}
      classNames={styles}
    />
  );
}
