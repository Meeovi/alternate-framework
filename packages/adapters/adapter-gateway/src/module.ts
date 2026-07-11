import { defineNuxtModule } from '@nuxt/kit'
import type { APISource } from '../types'
import { resolve } from 'node:path'

export interface GatewayAdapterModuleOptions {
  sources?: APISource[]
  envPrefix?: string
}

export default defineNuxtModule<GatewayAdapterModuleOptions>({
  meta: {
    name: '@mframework/adapter-gateway/nuxt',
    configKey: 'gatewayAdapter',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    sources: [],
    envPrefix: 'MESH_SOURCE_'
  },
  setup(options, nuxt) {
    const runtimeConfig = (nuxt.options.runtimeConfig || {}) as Record<string, any>
    runtimeConfig.public ||= {}
    nuxt.options.runtimeConfig = runtimeConfig as any

    const publicConfig = runtimeConfig.public as Record<string, any>
    
    const sources = options.sources || []
    
    publicConfig.gatewayAdapter = {
      enabled: true,
      sources: sources,
      envPrefix: options.envPrefix,
      loadedFromEnv: sources.length === 0
    }

    ;(nuxt.hooks as any).on('nitro:config', (nitroConfig: any) => {
      const moduleDir = resolve(__dirname, '..')
      nitroConfig.routes = nitroConfig.routes || []
      nitroConfig.routes.push({
        route: '/api/gateway/health',
        handler: resolve(moduleDir, 'server/api/health.get.ts')
      })
    })
  },
})

export const getSourcesFromEnv = (prefix: string, env: Record<string, string | undefined>): APISource[] => {
  const sources: APISource[] = []

  const sourceNames = new Set<string>()
  for (const key of Object.keys(env || {})) {
    const match = key.match(new RegExp(`^${prefix}([A-Z]+)_ENDPOINT$`))
    if (match) {
      sourceNames.add(match[1].toLowerCase())
    }
  }

  for (const sourceName of sourceNames) {
    const endpoint = env[`${prefix}${sourceName.toUpperCase()}_ENDPOINT`]
    const type = env[`${prefix}${sourceName.toUpperCase()}_TYPE`] || 'rest'
    const headersRaw = env[`${prefix}${sourceName.toUpperCase()}_HEADERS`]

    if (endpoint) {
      const source: APISource = {
        name: sourceName,
        type,
        endpoint,
        headers: headersRaw ? JSON.parse(headersRaw) : undefined
      }
      sources.push(source)
    }
  }

  return sources
}
