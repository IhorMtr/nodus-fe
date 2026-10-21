'use client';

import { Loader } from '@mantine/core';

import styles from './Spinner.module.scss';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
};

export function Spinner({
  size = 'md',
  className,
  label = 'Loading',
}: SpinnerProps) {
  return (
    <Loader
      type="oval"
      size={size}
      color="currentColor"
      className={className}
      classNames={{ root: styles.root }}
      role="status"
      aria-label={label}
    />
  );
}
