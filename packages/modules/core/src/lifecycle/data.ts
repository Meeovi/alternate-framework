// src/lifecycle/data.ts

import type { MAppContext } from './context'
import { runCompatHook } from '../compat/loader'

export async function runDataPhase(ctx: MAppContext, providers: any[]) {
  // Core data loading (native m modules) would go here

  // Then delegate to compat providers
  await runCompatHook(providers, 'runDataPhase', ctx)
}
