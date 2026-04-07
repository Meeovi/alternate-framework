import { createVuetifyOptions, type AlternateVuetifyOptions } from '../vuetify/options'

type NuxtLikeConfig = {
  css?: string[]
  modules?: Array<string | [string, Record<string, unknown>]>
  build?: {
    transpile?: string[]
    [key: string]: unknown
  }
  vuetify?: {
    vuetifyOptions?: Partial<AlternateVuetifyOptions>
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface AlternateUiNuxtOptions {
  includeCoreStyles?: boolean
  includeStorefrontStyles?: boolean
  includeVuetifyModule?: boolean
  includeStorefrontModule?: boolean
  includeTranspile?: boolean
  vuetify?: false | Partial<AlternateVuetifyOptions>
}

function mergeUnique<T>(...lists: Array<T[] | undefined>): T[] {
  return Array.from(new Set(lists.flatMap((list) => list ?? [])))
}

export function createAlternateUiNuxtConfig(
  options: AlternateUiNuxtOptions = {},
): NuxtLikeConfig {
  const {
    includeCoreStyles = true,
    includeStorefrontStyles = true,
    includeVuetifyModule = false,
    includeStorefrontModule = false,
    includeTranspile = true,
    vuetify = {},
  } = options

  const config: NuxtLikeConfig = {
    css: mergeUnique(
      includeCoreStyles ? ['alternate-ui/styles.css'] : [],
      includeStorefrontStyles ? ['alternate-ui/storefront/styles.css'] : [],
    ),
    build: {
      transpile: includeTranspile ? ['alternate-ui', 'vuetify'] : [],
    },
    modules: mergeUnique(
      includeVuetifyModule ? ['vuetify-nuxt-module'] : [],
      includeStorefrontModule ? ['@storefront-ui/nuxt'] : [],
    ),
  }

  if (vuetify !== false) {
    config.vuetify = {
      vuetifyOptions: createVuetifyOptions(vuetify),
    }
  }

  return config
}

export function withAlternateUiNuxtConfig<T extends NuxtLikeConfig>(
  config: T,
  options: AlternateUiNuxtOptions = {},
): T {
  const preset = createAlternateUiNuxtConfig(options)
  const nextConfig: NuxtLikeConfig = {
    ...config,
    css: mergeUnique(preset.css, config.css),
    modules: mergeUnique(preset.modules, config.modules),
    build: {
      ...(config.build ?? {}),
      transpile: mergeUnique(preset.build?.transpile, config.build?.transpile),
    },
  }

  if (options.vuetify !== false) {
    nextConfig.vuetify = {
      ...(config.vuetify ?? {}),
      vuetifyOptions: createVuetifyOptions({
        ...((config.vuetify?.vuetifyOptions as Partial<AlternateVuetifyOptions> | undefined) ?? {}),
        ...((options.vuetify as Partial<AlternateVuetifyOptions> | undefined) ?? {}),
      }),
    }
  }

  return nextConfig as T
}
