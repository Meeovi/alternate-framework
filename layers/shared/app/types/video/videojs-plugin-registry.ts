// videojs-plugin-registry.ts
import type { VideoJsPlugin } from './videojs-plugin'

const registry: VideoJsPlugin[] = []

export function registerVideoJsPlugin(plugin: VideoJsPlugin) {
  registry.push(plugin)
}

export function getVideoJsPlugins() {
  return registry
}
