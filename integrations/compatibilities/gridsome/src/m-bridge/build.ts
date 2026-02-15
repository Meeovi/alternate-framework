import type { CollectedHooks, ConfigureWebpackFn } from '../types'

export function applyConfigureWebpackHooks(
  hooks: CollectedHooks,
  baseConfig: any,
): any {
  let config = { ...baseConfig }

  for (const fn of hooks.configureWebpackFns) {
    const result = fn(config)
    if (result) config = result
  }

  return config
}
