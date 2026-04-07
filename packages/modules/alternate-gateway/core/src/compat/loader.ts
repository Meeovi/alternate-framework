// src/compat/loader.ts

import type { MCompatProvider, MAppContext } from './index'

/**
 * Default list of known compat modules.
 * Users can extend this via config later if they want.
 */
const KNOWN_COMPAT_MODULES = [
  '@m/compat-gridsome',
  '@m/compat-vuepress',
  '@m/compat-react',
]

export function loadCompatProviders(appRoot: string): MCompatProvider[] {
  const providers: MCompatProvider[] = []

  for (const mod of KNOWN_COMPAT_MODULES) {
    try {
      const resolved = require.resolve(mod, { paths: [appRoot] })
      const imported = require(resolved)
      const provider: MCompatProvider = imported.default || imported

      if (!provider || !provider.name) continue

      providers.push(provider)
    } catch {
      // Not installed in this app — silently skip
      continue
    }
  }

  return providers
}

/**
 * Helper to run a given hook on all providers, in order.
 */
export async function runCompatHook<K extends keyof MCompatProvider>(
  providers: MCompatProvider[],
  hook: K,
  ctx: MAppContext,
) {
  for (const provider of providers) {
    const fn = provider[hook]
    if (typeof fn === 'function') {
      await fn.call(provider, ctx)
    }
  }
}

/**
 * Helper to fold build config through all providers.
 */
export function foldBuildConfig(
  providers: MCompatProvider[],
  initialConfig: any,
  ctx: MAppContext,
): any {
  return providers.reduce((config, provider) => {
    if (typeof provider.extendBuildConfig === 'function') {
      return provider.extendBuildConfig(config, ctx)
    }
    return config
  }, initialConfig)
}
