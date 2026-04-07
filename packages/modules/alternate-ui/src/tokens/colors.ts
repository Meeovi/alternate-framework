export const colors = {
  primary: '#4F46E5',
  secondary: '#64748B',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#2563EB',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  'on-primary': '#FFFFFF',
  'on-secondary': '#FFFFFF',
  'on-background': '#0F172A',
  'on-surface': '#0F172A',
} as const

export type AlternateUIColorTokens = typeof colors

/**
 * Theme colour tokens (dark/light mode backgrounds + default accent).
 * These were previously inlined in `layers/shared/app/constants/index.ts`
 * and have been consolidated here as the authoritative source.
 */
export const themeColors = {
  defaultTheme: '#cc7d24',
  themeDark: '#111111',
  themeLight: '#fafafa',
  backgroundDark: '#fafafa',
  backgroundLight: '#111111',
} as const

export type AlternateUIThemeColors = typeof themeColors

/**
 * Alias matching the legacy export name used across the codebase.
 * @deprecated import `themeColors` instead.
 */
export const THEME_COLORS = themeColors
