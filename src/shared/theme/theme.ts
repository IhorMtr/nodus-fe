import {
  createTheme,
  defaultVariantColorsResolver,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core';

// ==================== PALETTES ====================

const graphite: MantineColorsTuple = [
  'var(--primary-0)',
  'var(--primary-1)',
  'var(--primary-2)',
  'var(--primary-3)',
  'var(--primary-4)',
  'var(--primary-5)',
  'var(--primary-6)',
  'var(--primary-7)',
  'var(--primary-8)',
  'var(--primary-9)',
];

const gray: MantineColorsTuple = [
  'var(--light-1)',
  'var(--light-2)',
  'var(--light-3)',
  'var(--light-4)',
  'var(--light-5)',
  'var(--light-6)',
  'var(--light-7)',
  'var(--light-8)',
  'var(--light-9)',
  'var(--primary-9)',
];

const dark: MantineColorsTuple = [
  'var(--light-7)',
  'var(--light-9)',
  'var(--primary-9)',
  'var(--dark-9)',
  'var(--dark-8)',
  'var(--dark-5)',
  'var(--dark-3)',
  'var(--dark-2)',
  'var(--dark-1)',
  'var(--dark-0)',
];

// ==================== THEME ====================

export const theme = createTheme({
  colors: { graphite, gray, dark },
  primaryColor: 'graphite',
  primaryShade: 0,
  fontFamily: 'var(--font-family-sans)',
  headings: {
    fontFamily: 'var(--font-family-sans)',
  },
  defaultRadius: 'var(--radius-control)',
  respectReducedMotion: true,
  variantColorResolver(input) {
    const resolved = defaultVariantColorsResolver(input);

    // Mantine cannot infer contrast from CSS variable palette entries.
    if (
      (input.color ?? input.theme.primaryColor) === 'graphite' &&
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
  '--mantine-primary-color-contrast': 'var(--color-on-primary)',
  '--mantine-color-graphite-contrast': 'var(--color-on-primary)',
  '--mantine-color-graphite-text': 'var(--color-primary-text)',
  '--mantine-color-graphite-filled': 'var(--color-primary)',
  '--mantine-color-graphite-filled-hover': 'var(--color-primary-hover)',
  '--mantine-color-graphite-light': 'var(--color-primary-subtle)',
  '--mantine-color-graphite-light-hover': 'var(--color-surface-hover)',
  '--mantine-color-graphite-light-color': 'var(--color-primary-text)',
  '--mantine-color-graphite-outline': 'var(--color-primary-text)',
  '--mantine-color-graphite-outline-hover': 'var(--color-primary-subtle)',
};

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: semanticColors,
  dark: semanticColors,
});
