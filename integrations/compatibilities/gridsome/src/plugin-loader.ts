import { loadGridsomePlugin } from './api-shim'

export function loadGridsomePlugins(appRoot: string) {
  let userConfig

  try {
    userConfig = require(require.resolve(`${appRoot}/gridsome-plugins.ts`))
  } catch {
    return []
  }

  const plugins = []

  for (const entry of userConfig.default || userConfig.plugins || []) {
    const plugin = require(require.resolve(entry.use, { paths: [appRoot] }))
    plugins.push(loadGridsomePlugin(plugin, entry.options, entry.use))
  }

  return plugins
}
