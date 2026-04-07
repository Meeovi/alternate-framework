import { colors, spacing, typography, type AlternateUIColorTokens, type AlternateUISpacingTokens, type AlternateUITypographyTokens } from './tokens'

export interface AlternateUIConfig {
  name?: string
  theme?: {
    colors?: Partial<AlternateUIColorTokens>
    spacing?: Partial<AlternateUISpacingTokens>
    typography?: Partial<AlternateUITypographyTokens>
  }
}

export interface AlternateUIInstance {
  name: string
  theme: {
    colors: AlternateUIColorTokens
    spacing: AlternateUISpacingTokens
    typography: AlternateUITypographyTokens
  }
}

export function createUI(config: AlternateUIConfig = {}): AlternateUIInstance {
  return {
    name: config.name || 'alternate-ui',
    theme: {
      colors: {
        ...colors,
        ...config.theme?.colors,
      },
      spacing: {
        ...spacing,
        ...config.theme?.spacing,
      },
      typography: {
        ...typography,
        ...config.theme?.typography,
      },
    },
  }
}
