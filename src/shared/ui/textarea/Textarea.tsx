'use client';

import {
  Textarea as MantineTextarea,
  type TextareaProps as MantineTextareaProps,
} from '@mantine/core';
import type { ComponentPropsWithRef } from 'react';

import styles from './Textarea.module.scss';

// ==================== TYPES ====================

export type TextareaProps = Omit<ComponentPropsWithRef<'textarea'>, 'color'> &
  Pick<
    MantineTextareaProps,
    | 'label'
    | 'description'
    | 'error'
    | 'withAsterisk'
    | 'autosize'
    | 'minRows'
    | 'maxRows'
  > & {
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
  };

// ==================== COMPONENT ====================

export function Textarea({
  size = 'md',
  fullWidth = true,
  autosize = false,
  ...props
}: TextareaProps) {
  return (
    <MantineTextarea
      {...props}
      size={size}
      autosize={autosize}
      resize={autosize ? 'none' : 'vertical'}
      wrapperProps={{
        'data-size': size,
        'data-full-width': fullWidth || undefined,
      }}
      classNames={{
        root: styles.root,
        wrapper: styles.wrapper,
        input: styles.input,
        label: styles.label,
        description: styles.description,
        error: styles.error,
        required: styles.required,
      }}
    />
  );
}
