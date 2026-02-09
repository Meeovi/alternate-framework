// m-app/gridsome-plugins.ts
import { loadGridsomePlugin, runLoadSourceHooks, runCreatePagesHooks, applyConfigureWebpackHooks } from '@m/gridsome-compat'

// 1. Import a real Gridsome plugin from npm
import remarkPlugin from 'gridsome-plugin-remark' // example

const loadedPlugins = [
  loadGridsomePlugin(remarkPlugin, { /* plugin options */ }, 'gridsome-plugin-remark'),
  // load more plugins here
]

export async function runGridsomeDataPhase(mDataRegistry: any) {
  for (const plugin of loadedPlugins) {
    await runLoadSourceHooks(plugin.hooks, mDataRegistry)
  }
}

export async function runGridsomePagesPhase(mRouter: any) {
  for (const plugin of loadedPlugins) {
    await runCreatePagesHooks(plugin.hooks, mRouter)
  }
}

export function applyGridsomeWebpackExtensions(baseConfig: any) {
  let config = baseConfig
  for (const plugin of loadedPlugins) {
    config = applyConfigureWebpackHooks(plugin.hooks, config)
  }
  return config
}
