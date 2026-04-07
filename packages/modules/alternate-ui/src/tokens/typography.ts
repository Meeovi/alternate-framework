export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    display: 'Space Grotesk, Inter, system-ui, sans-serif',
    mono: 'Courier New, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const

export type AlternateUITypographyTokens = typeof typography

  /**
   * Legacy px-based font-size map used by the social settings panel.
   * Previously in `layers/shared/app/constants/options.ts`.
   * @deprecated use `typography.fontSize` scale instead.
   */
  export const legacyFontSizes = {
    xs: '13px',
    sm: '14px',
    md: '15px',
    lg: '16px',
    xl: '17px',
  } as const

  export type AlternateUILegacyFontSizes = typeof legacyFontSizes

  /** Alias for backward compatibility. */
  export const oldFontSizeMap = legacyFontSizes
