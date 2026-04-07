// src/lifecycle/runtime.ts

import { createMAppContext, type MAppContext } from './context'
import { loadCompatProviders, runCompatHook } from '../compat/loader'
import { runDataPhase } from './data'
import { runPagesPhase } from './pages'
import { applyBuildConfig } from './build'

export interface RunMAppOptions {
  appRoot: string
  env?: 'development' | 'production' | 'test'

  dataRegistry: any
  router: any
  initialBuildConfig: any
}

/**
 * Main entry point for m-core runtime.
 * This is what your CLI / Nuxt layer / app shell will call.
 */
export async function runMApp(options: RunMAppOptions): Promise<MAppContext> {
  const ctx = createMAppContext({
    appRoot: options.appRoot,
    env: options.env,
    data: options.dataRegistry,
    router: options.router,
    buildConfig: options.initialBuildConfig,
  })

  const providers = loadCompatProviders(options.appRoot)

  // Setup phase
  await runCompatHook(providers, 'setup', ctx)

  // Data phase
  await runDataPhase(ctx, providers)

  // Pages phase
  await runPagesPhase(ctx, providers)

  // Build config
  applyBuildConfig(ctx, providers)

  return ctx
}
