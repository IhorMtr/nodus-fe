'use client';

import { PasswordInput, TextInput, type TextInputProps } from '@mantine/core';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import styles from './Input.module.scss';

// ==================== TYPES ====================

type InputBaseProps = Omit<
  ComponentPropsWithRef<'input'>,
  'size' | 'type' | 'color'
> &
  Pick<TextInputProps, 'label' | 'description' | 'error' | 'withAsterisk'> & {
    leftIcon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
  };

export type InputProps = InputBaseProps &
  (
    | {
        type: 'password';
        showPasswordToggle?: boolean;
        // Mantine replaces the visibility button when rightSection is supplied.
        rightIcon?: never;
      }
    | {
        type?: ComponentPropsWithRef<'input'>['type'];
        showPasswordToggle?: false;
        rightIcon?: ReactNode;
      }
  );

// ==================== STYLES ====================

const classNames = {
  root: styles.root,
  wrapper: styles.wrapper,
  input: styles.input,
  innerInput: styles.innerInput,
  section: styles.section,
  label: styles.label,
  description: styles.description,
  error: styles.error,
  required: styles.required,
  visibilityToggle: styles.visibilityToggle,
};

function VisibilityToggleIcon({ reveal }: { reveal: boolean }) {
  const Icon = reveal ? EyeOff : Eye;

  return <Icon aria-hidden="true" />;
}

// ==================== COMPONENT ====================

export function Input({
  type = 'text',
  showPasswordToggle = false,
  leftIcon,
  rightIcon,
  size = 'md',
  fullWidth = true,
  className,
  error,
  ...props
}: InputProps) {
  const actions = useTranslations('common.actions');

  const sharedProps = {
    ...props,
    error,
    size,
    className,
    classNames,
    wrapperProps: {
      'data-size': size,
      'data-full-width': fullWidth || undefined,
    },
    leftSection: leftIcon ? (
      <span aria-hidden="true">{leftIcon}</span>
    ) : undefined,
    leftSectionWidth: 'var(--control-height)',
    rightSectionWidth: 'var(--control-height)',
  };

  if (type === 'password' && showPasswordToggle) {
    return (
      <PasswordInput
        {...sharedProps}
        aria-invalid={props['aria-invalid'] ?? (Boolean(error) || undefined)}
        visibilityToggleIcon={VisibilityToggleIcon}
        visibilityToggleFocusable
        visibilityToggleButtonProps={{
          type: 'button',
          'aria-label': actions('togglePasswordVisibility'),
        }}
      />
    );
  }

  return (
    <TextInput
      {...sharedProps}
      type={type}
      rightSection={
        rightIcon ? <span aria-hidden="true">{rightIcon}</span> : undefined
      }
      rightSectionPointerEvents="none"
    />
  );
}
