import { blueprint } from './blueprint'
import { vuetifyTheme } from './theme'

export interface AlternateVuetifyOptions {
  aliases?: Record<string, unknown>
  blueprint?: Record<string, unknown>
  components?: Record<string, unknown>
  date?: Record<string, unknown>
  defaults?: Record<string, unknown>
  directives?: Record<string, unknown>
  display?: Record<string, unknown>
  icons?: Record<string, unknown>
  locale?: Record<string, unknown>
  ssr?: boolean
  theme?: {
    defaultTheme?: string
    themes?: Record<string, Record<string, unknown>>
    [key: string]: unknown
  }
  [key: string]: unknown
}

function mergeThemes(overrides?: AlternateVuetifyOptions['theme']): AlternateVuetifyOptions['theme'] {
  if (!overrides) {
    return vuetifyTheme
  }

  const baseThemes = vuetifyTheme.themes ?? {}
  const overrideThemes = overrides.themes ?? {}
  const mergedThemes = Object.fromEntries(
    Array.from(new Set([...Object.keys(baseThemes), ...Object.keys(overrideThemes)])).map((themeName) => {
      const baseTheme = (baseThemes as Record<string, any>)[themeName] ?? {}
      const overrideTheme = (overrideThemes as Record<string, any>)[themeName] ?? {}

      return [
        themeName,
        {
          ...baseTheme,
          ...overrideTheme,
          colors: {
            ...(baseTheme.colors ?? {}),
            ...(overrideTheme.colors ?? {}),
          },
        },
      ]
    }),
  )

  return {
    ...vuetifyTheme,
    ...overrides,
    themes: mergedThemes,
  }
}

export function createVuetifyOptions(
  overrides: Partial<AlternateVuetifyOptions> = {},
): AlternateVuetifyOptions {
  return {
    components: overrides.components,
    directives: overrides.directives,
    blueprint: {
      ...blueprint,
      ...(overrides.blueprint ?? {}),
    },
    defaults: {
      ...(blueprint.defaults ?? {}),
      ...(overrides.defaults ?? {}),
    },
    theme: mergeThemes(overrides.theme),
    icons: overrides.icons,
    aliases: overrides.aliases,
    date: overrides.date,
    display: overrides.display,
    locale: overrides.locale,
    ssr: overrides.ssr,
  }
}
