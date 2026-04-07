import { tokens } from '../../tokens'

export const vuetifyTheme = {
  defaultTheme: 'light',
  themes: {
    light: {
      colors: tokens.colors,
    },
  },
} as const