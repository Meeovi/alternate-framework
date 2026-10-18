/**
 * Ambient shims so the module's runtime/server sources type-check in
 * isolation. At runtime these come from Nitro.
 */
declare module '#imports' {
  export function useRuntimeConfig(event?: unknown): Record<string, any>
}
