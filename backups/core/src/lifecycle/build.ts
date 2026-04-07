// src/lifecycle/build.ts

import type { MAppContext } from './context'
import { foldBuildConfig } from '../compat/loader'

export function applyBuildConfig(ctx: MAppContext, providers: any[]) {
  ctx.buildConfig = foldBuildConfig(providers, ctx.buildConfig, ctx)
  return ctx.buildConfig
}
