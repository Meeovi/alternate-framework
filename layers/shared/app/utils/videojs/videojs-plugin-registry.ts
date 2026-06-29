// utils/videojs/videojs-plugin-registry.ts

/**
 * Video.js Plugin Interface
 */
export interface VideoJsPlugin {
  name: string
  beforeCreate?(config: any): void
  onCreate?(player: any, videojs: any): void
  onReady?(player: any): void
  onEvent?(event: string, data: any, player: any): void
  onDestroy?(player: any): void
}

/**
 * Internal plugin registry
 */
const registry: VideoJsPlugin[] = []

/**
 * Register a plugin manually (optional)
 */
export function registerVideoJsPlugin(plugin: VideoJsPlugin) {
  registry.push(plugin)
}

/**
 * Auto‑discover plugins inside utils/videojs/plugins/
 *
 * Works in Nuxt layers, SSR‑safe, supports TS/JS.
 */
function autoDiscoverPlugins() {
  // Nuxt auto-import friendly glob
  const modules = import.meta.glob('./plugins/*.{ts,js}', {
    eager: true
  })

  Object.values(modules).forEach((mod: any) => {
    const plugin: VideoJsPlugin =
      mod.default || mod.plugin || mod.VideoJsPlugin

    if (!plugin || !plugin.name) {
      console.warn('[videojs] Skipped plugin: missing name or invalid export')
      return
    }

    registry.push(plugin)
  })
}

// Run auto-discovery immediately
autoDiscoverPlugins()

/**
 * Export all registered plugins
 */
export function getVideoJsPlugins(): VideoJsPlugin[] {
  return registry
}
