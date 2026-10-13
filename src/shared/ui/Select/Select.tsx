'use client';

import {
  Select as MantineSelect,
  type SelectProps as MantineSelectProps,
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import styles from './Select.module.scss';

// ==================== TYPES ====================

type SelectValue = string | number | boolean | bigint;

type NativeInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  | 'children'
  | 'color'
  | 'defaultValue'
  | 'onChange'
  | 'size'
  | 'style'
  | 'type'
  | 'value'
>;

export type SelectProps<Value extends SelectValue = string> = NativeInputProps &
  Pick<
    MantineSelectProps<Value>,
    | 'label'
    | 'description'
    | 'error'
    | 'withAsterisk'
    | 'data'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'onClear'
    | 'searchable'
    | 'clearable'
    | 'allowDeselect'
    | 'nothingFoundMessage'
    | 'searchValue'
    | 'defaultSearchValue'
    | 'onSearchChange'
    | 'filter'
    | 'renderOption'
    | 'limit'
    | 'maxDropdownHeight'
    | 'dropdownOpened'
    | 'defaultDropdownOpened'
    | 'onDropdownOpen'
    | 'onDropdownClose'
    | 'onOptionSubmit'
    | 'selectFirstOptionOnChange'
    | 'selectFirstOptionOnDropdownOpen'
    | 'autoSelectOnBlur'
    | 'openOnFocus'
  > & {
    leftIcon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    clearButtonLabel?: string;
  };

// ==================== COMPONENT ====================

export function Select<Value extends SelectValue = string>({
  leftIcon,
  size = 'md',
  fullWidth = true,
  clearButtonLabel,
  ...props
}: SelectProps<Value>) {
  const actions = useTranslations('common.actions');

  return (
    <MantineSelect<Value>
      {...props}
      size={size}
      wrapperProps={{
        'data-size': size,
        'data-full-width': fullWidth || undefined,
      }}
      leftSection={
        leftIcon ? <span aria-hidden="true">{leftIcon}</span> : undefined
      }
      leftSectionWidth="var(--control-height)"
      chevronColor="var(--input-section-color)"
      checkIconPosition="right"
      withAlignedLabels
      clearButtonProps={{
        className: styles.clearButton,
        'aria-label': clearButtonLabel ?? actions('clearSelection'),
        'aria-hidden': false,
        tabIndex: 0,
      }}
      classNames={styles}
      attributes={{
        dropdown: { 'data-size': size },
        options: { 'data-size': size },
      }}
    />
  );
}
