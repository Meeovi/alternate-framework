
export interface FrameworkContext {
  getRequestURL?(): string
  getRequestHeaders?(): Record<string, string>
  getConfig?(): any
  reloadApp?(): void
  state?<T>(key: string, init: () => T): { value: T }
}

let ctx: FrameworkContext = {}

/**
 * Frameworks (Nuxt, React, etc.) call this once during initialization.
 */
export function setFrameworkContext(newCtx: FrameworkContext) {
  ctx = { ...ctx, ...newCtx }
}

/**
 * Auth providers use this to access framework-specific helpers.
 */
export function getFrameworkContext(): FrameworkContext {
  return ctx
}