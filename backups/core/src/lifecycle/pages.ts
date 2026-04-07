// src/lifecycle/pages.ts

import type { MAppContext } from './context'
import { runCompatHook } from '../compat/loader'

export async function runPagesPhase(ctx: MAppContext, providers: any[]) {
  // Core route/page generation would go here

  // Then delegate to compat providers
  await runCompatHook(providers, 'runPagesPhase', ctx)
}
