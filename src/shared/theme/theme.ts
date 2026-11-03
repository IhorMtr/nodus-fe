import {
  createTheme,
  defaultVariantColorsResolver,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core';

// ==================== PALETTES ====================

const neutral: MantineColorsTuple = [
  'var(--neutral-1)',
  'var(--neutral-2)',
  'var(--neutral-3)',
  'var(--neutral-4)',
  'var(--neutral-5)',
  'var(--neutral-6)',
  'var(--neutral-7)',
  'var(--neutral-8)',
  'var(--neutral-9)',
  'var(--neutral-9)',
];

const gray: MantineColorsTuple = [
  'var(--mist-1)',
  'var(--mist-2)',
  'var(--mist-3)',
  'var(--mist-4)',
  'var(--mist-5)',
  'var(--mist-6)',
  'var(--mist-7)',
  'var(--mist-8)',
  'var(--mist-9)',
  'var(--ink-dark-2)',
];

const dark: MantineColorsTuple = [
  'var(--ink-light-1)',
  'var(--ink-light-2)',
  'var(--ink-light-3)',
  'var(--graphite-9)',
  'var(--graphite-7)',
  'var(--graphite-6)',
  'var(--graphite-4)',
  'var(--graphite-2)',
  'var(--graphite-1)',
  'var(--graphite-0)',
];

// ==================== THEME ====================

export const theme = createTheme({
  colors: { neutral, gray, dark },
  primaryColor: 'neutral',
  primaryShade: { light: 6, dark: 5 },
  fontFamily: 'var(--font-family-sans)',
  headings: {
    fontFamily: 'var(--font-family-sans)',
  },
  defaultRadius: 'var(--radius-control)',
  respectReducedMotion: true,
  variantColorResolver(input) {
    const resolved = defaultVariantColorsResolver(input);

    if (
      (input.color ?? input.theme.primaryColor) === 'neutral' &&
      input.variant === 'filled'
    ) {
      return {
        ...resolved,
        background: 'var(--color-primary)',
        hover: 'var(--color-primary-hover)',
        color: 'var(--color-on-primary)',
      };
    }

    return resolved;
  },
});

// ==================== SEMANTIC VARIABLES ====================

const semanticColors = {
  // ==================== BASE COLORS ====================

  '--mantine-color-bright': 'var(--color-text-primary)',
  '--mantine-color-text': 'var(--color-text-primary)',
  '--mantine-color-body': 'var(--color-background)',
  '--mantine-color-error': 'var(--color-danger-text)',
  '--mantine-color-success': 'var(--color-success-text)',
  '--mantine-color-placeholder': 'var(--color-text-muted)',
  '--mantine-color-anchor': 'var(--color-primary-text)',
  '--mantine-color-dimmed': 'var(--color-text-secondary)',
  '--mantine-color-default': 'var(--color-surface-elevated)',
  '--mantine-color-default-hover': 'var(--color-surface-hover)',
  '--mantine-color-default-color': 'var(--color-text-primary)',
  '--mantine-color-default-border': 'var(--color-border)',
  '--mantine-color-disabled': 'var(--color-surface)',
  '--mantine-color-disabled-color': 'var(--color-text-disabled)',
  '--mantine-color-disabled-border': 'var(--color-divider)',

  // ==================== PRIMARY COLORS ====================

  '--mantine-primary-color-filled': 'var(--color-primary)',
  '--mantine-primary-color-filled-hover': 'var(--color-primary-hover)',
  '--mantine-primary-color-light': 'var(--color-primary-subtle)',
  '--mantine-primary-color-light-hover': 'var(--color-surface-hover)',
  '--mantine-primary-color-light-color': 'var(--color-primary-text)',
  '--mantine-primary-color-contrast': 'var(--color-on-primary)',
  '--mantine-color-neutral-contrast': 'var(--color-on-primary)',
  '--mantine-color-neutral-text': 'var(--color-primary-text)',
  '--mantine-color-neutral-filled': 'var(--color-primary)',
  '--mantine-color-neutral-filled-hover': 'var(--color-primary-hover)',
  '--mantine-color-neutral-light': 'var(--color-primary-subtle)',
  '--mantine-color-neutral-light-hover': 'var(--color-surface-hover)',
  '--mantine-color-neutral-light-color': 'var(--color-primary-text)',
  '--mantine-color-neutral-outline': 'var(--color-primary-text)',
  '--mantine-color-neutral-outline-hover': 'var(--color-primary-subtle)',

  // ==================== STATUS COLORS ====================

  '--mantine-color-red-filled': 'var(--color-danger)',
  '--mantine-color-red-light': 'var(--color-danger-subtle)',
  '--mantine-color-red-light-color': 'var(--color-danger-text)',
  '--mantine-color-red-light-hover': 'var(--color-danger-subtle)',
  '--mantine-color-red-text': 'var(--color-danger-text)',
  '--mantine-color-green-filled': 'var(--color-success)',
  '--mantine-color-green-light': 'var(--color-success-subtle)',
  '--mantine-color-green-light-color': 'var(--color-success-text)',
  '--mantine-color-green-text': 'var(--color-success-text)',
  '--mantine-color-yellow-filled': 'var(--color-warning)',
  '--mantine-color-yellow-light': 'var(--color-warning-subtle)',
  '--mantine-color-yellow-light-color': 'var(--color-warning-text)',
  '--mantine-color-yellow-text': 'var(--color-warning-text)',
  '--mantine-color-blue-filled': 'var(--color-info)',
  '--mantine-color-blue-light': 'var(--color-info-subtle)',
  '--mantine-color-blue-light-color': 'var(--color-info-text)',
  '--mantine-color-blue-text': 'var(--color-info-text)',
};

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: semanticColors,
  dark: semanticColors,
});
