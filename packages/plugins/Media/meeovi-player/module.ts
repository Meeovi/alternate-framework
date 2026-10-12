import { defineNuxtModule, createResolver, addComponentsDir } from '@nuxt/kit'
import { PLAYER_IMPORTS, PLAYER_TAGS } from './runtime/loaders'
import type { MeeoviPlayerModuleOptions } from './runtime/types'

export type { MeeoviPlayerModuleOptions } from './runtime/types'
export * from './runtime/types'

type CustomElementCheck = (tag: string) => boolean

/** Add Video.js's exact tags to an isCustomElement check, keeping any
 *  existing rule. */
function withPlayerTags(previous?: CustomElementCheck): CustomElementCheck {
  const tags = new Set(PLAYER_TAGS)
  return (tag) => tags.has(tag) || Boolean(previous?.(tag))
}

export default defineNuxtModule<MeeoviPlayerModuleOptions>({
  meta: {
    name: 'meeovi-player',
    configKey: 'meeoviPlayer',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    skin: 'default',
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // <MeeoviPlayer>
    addComponentsDir({ path: resolver.resolve('runtime/components'), pathPrefix: false })

    // Video.js 10 tags are custom elements, not Vue components. This Nuxt
    // version doesn't forward the top-level `vue.compilerOptions` to
    // @vitejs/plugin-vue, so set the check in both places.
    const vueOptions = nuxt.options.vue as { compilerOptions?: { isCustomElement?: CustomElementCheck } }
    vueOptions.compilerOptions ||= {}
    vueOptions.compilerOptions.isCustomElement = withPlayerTags(vueOptions.compilerOptions.isCustomElement)

    const vite = nuxt.options.vite as { vue?: { template?: { compilerOptions?: { isCustomElement?: CustomElementCheck } } } }
    vite.vue ||= {}
    vite.vue.template ||= {}
    vite.vue.template.compilerOptions ||= {}
    vite.vue.template.compilerOptions.isCustomElement = withPlayerTags(vite.vue.template.compilerOptions.isCustomElement)

    // Players load Video.js on demand (dynamic imports). Pre-bundle those
    // entries in dev so Vite doesn't discover them mid-page, re-optimize
    // and fail the in-flight import ("504 Outdated Optimize Dep").
    const viteConfig = nuxt.options.vite as { optimizeDeps?: { include?: string[] } }
    viteConfig.optimizeDeps ||= {}
    viteConfig.optimizeDeps.include = [...(viteConfig.optimizeDeps.include || []), ...PLAYER_IMPORTS]

    nuxt.options.runtimeConfig.public.meeoviPlayer = {
      ...(nuxt.options.runtimeConfig.public.meeoviPlayer as Record<string, unknown> || {}),
      skin: options.skin || 'default',
    }
  },
})
