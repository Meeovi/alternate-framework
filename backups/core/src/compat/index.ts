// src/compat/index.ts

export interface MCompatProvider {
  /** Unique name for logging/debugging */
  name: string

  /** Called once at startup, before any phases */
  setup?: (ctx: MAppContext) => void | Promise<void>

  /** Data loading / content sourcing phase */
  runDataPhase?: (ctx: MAppContext) => void | Promise<void>

  /** Route / page generation phase */
  runPagesPhase?: (ctx: MAppContext) => void | Promise<void>

  /** Build configuration extension (Webpack/Vite/etc.) */
  extendBuildConfig?: (config: any, ctx: MAppContext) => any
}

/**
 * Forward declaration to avoid circular imports.
 * The real type is defined in lifecycle/context.ts
 */
export interface MAppContext {
  appRoot: string
  env: 'development' | 'production' | 'test'

  data: any
  router: any
  buildConfig: any

  /** Free-form bag for compat modules to stash state */
  compatState: Record<string, any>
}
