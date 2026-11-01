import {
  createTheme,
  defaultVariantColorsResolver,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core';

// ==================== PALETTES ====================

// Mantine needs ten shades per color. They point at the raw palette in
// `_colors.scss`; components still read semantic tokens, not these.

const steel: MantineColorsTuple = [
  'var(--steel-1)',
  'var(--steel-2)',
  'var(--steel-3)',
  'var(--steel-4)',
  'var(--steel-5)',
  'var(--steel-6)',
  'var(--steel-7)',
  'var(--steel-8)',
  'var(--steel-9)',
  'var(--steel-9)',
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
  colors: { steel, gray, dark },
  primaryColor: 'steel',
  primaryShade: { light: 6, dark: 5 },
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
      (input.color ?? input.theme.primaryColor) === 'steel' &&
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
  // ---------- Base ----------

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

  // ---------- Primary ----------

  '--mantine-primary-color-filled': 'var(--color-primary)',
  '--mantine-primary-color-filled-hover': 'var(--color-primary-hover)',
  '--mantine-primary-color-light': 'var(--color-primary-subtle)',
  '--mantine-primary-color-light-hover': 'var(--color-surface-hover)',
  '--mantine-primary-color-light-color': 'var(--color-primary-text)',
  '--mantine-primary-color-contrast': 'var(--color-on-primary)',
  '--mantine-color-steel-contrast': 'var(--color-on-primary)',
  '--mantine-color-steel-text': 'var(--color-primary-text)',
  '--mantine-color-steel-filled': 'var(--color-primary)',
  '--mantine-color-steel-filled-hover': 'var(--color-primary-hover)',
  '--mantine-color-steel-light': 'var(--color-primary-subtle)',
  '--mantine-color-steel-light-hover': 'var(--color-surface-hover)',
  '--mantine-color-steel-light-color': 'var(--color-primary-text)',
  '--mantine-color-steel-outline': 'var(--color-primary-text)',
  '--mantine-color-steel-outline-hover': 'var(--color-primary-subtle)',

  // ---------- Status ----------

  // Mantine notifications and alerts use these named colors; they resolve to
  // the same semantic status tokens as the rest of the interface.
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
