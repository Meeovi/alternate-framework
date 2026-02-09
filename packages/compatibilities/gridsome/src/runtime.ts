import { createGridsomeAPIShim } from './api-shim'
import type { GridsomePlugin, CollectedHooks } from './types'

export interface LoadedPlugin {
  name: string
  hooks: CollectedHooks
}

export function loadGridsomePlugin(
  plugin: GridsomePlugin,
  options?: any,
  name = 'anonymous-plugin',
): LoadedPlugin {
  const { api, hooks } = createGridsomeAPIShim()

  plugin(api, options)

  return { name, hooks }
}
