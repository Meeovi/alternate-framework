import { authPluginHost } from '../utils/plugins'

/**
 * Auth plugins in the integrations catalog: registers the auth plugin host
 * as meeovi-integrations' site scope
 * (`Symbol.for('mframework.integrations.site')`), so admins switch auth
 * plugin packages on and off for the whole site from the integrations page,
 * see what each sandboxed one may do, and edit its settings. Also loads the
 * switches at startup and stops sandbox processes on shutdown.
 */
export default defineNitroPlugin((nitroApp) => {
  if (import.meta.prerender) return

  ;(globalThis as Record<symbol, unknown>)[Symbol.for('mframework.integrations.site')] = {
    handles: (plugin: string) => authPluginHost.handles(plugin),
    async details(plugin: string) {
      const info = await authPluginHost.info(plugin)
      return info && {
        enabled: info.enabled,
        updatedAt: info.updatedAt,
        sandboxed: info.tier === 'sandboxed',
        permissions: info.permissions,
        settings: info.settings,
      }
    },
    setEnabled: (plugin: string, enabled: boolean, actorId: string) => authPluginHost.setEnabled(plugin, enabled, actorId),
    settings: (plugin: string) => authPluginHost.settings(plugin),
    saveSettings: (plugin: string, input: unknown, actorId: string) => authPluginHost.saveSettings(plugin, input, actorId),
  }

  void authPluginHost.refresh()
  nitroApp.hooks.hook('close', () => authPluginHost.stopAll())
})
