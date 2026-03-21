/**
 * Mesh Integration Nuxt Module
 *
 * Automatically initializes the mesh gateway at server startup and configures
 * it to work seamlessly with the commerce layer and other layer adapters.
 *
 * This module:
 * 1. Ensures mesh dependencies are bundled correctly
 * 2. Preloads adapters before mesh initialization
 * 3. Exposes mesh utilities to composables via server routes
 *
 * See: docs/mesh-architecture.md
 */

import { defineNuxtModule, createResolver, addPlugin } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@mframework/commerce-mesh',
    configKey: 'commerceMesh',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },

  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Ensure mesh packages are bundled and not external
    nuxt.hook('nitro:config', (config) => {
      config.externals = config.externals || {}
      config.externals.inline = config.externals.inline || []

      // Mesh packages must be bundled, not external
      const meshPackages = [
        '@graphql-mesh/runtime',
        '@graphql-mesh/core',
        '@graphql-mesh/cross-fetch',
        'graphql',
        'graphql-tag',
      ]

      meshPackages.forEach((pkg) => {
        if (!config.externals.inline!.includes(pkg)) {
          config.externals.inline!.push(pkg)
        }
      })

      console.info('[mesh-module] Configured mesh packages for bundling')
    })

    // Add mesh initialization plugin
    addPlugin(resolve('./runtime/composables.server.ts'))
  },
})
