import { validateSearchConfig, type SearchModuleConfig } from './config/schema'
import { SearchManager } from './core/SearchManager'

// Minimal, runtime-agnostic module shim. The real runtime may provide
// adapters via ctx.getAdapter('search'), in which case we create a SearchManager.
export default {
  id: 'search',
  adapters: {},

  async setup(ctx: any) {
    const config: SearchModuleConfig | undefined = ctx?.config?.search
    if (!config) return

    // validate when possible
    try {
      validateSearchConfig(config)
    } catch (e) {
      // Ignore validation errors at runtime — config may be partial during startup.
    }

    const adapter = ctx?.getAdapter ? ctx.getAdapter('search') : undefined
    if (adapter) {
      ctx.searchManager = new SearchManager(adapter)
      // Expose to global for runtime plugins and helpers; emit event for listeners
      try {
        ;(globalThis as any).searchManager = ctx.searchManager
        const bus = ctx?.eventBus
        if (bus && typeof bus.emit === 'function') bus.emit('adapter:registered', { key: 'search' })
      } catch (e) {
        /* noop */
      }
    }

    // Listen for app readiness or adapter registration when an event bus exists
    const bus = ctx?.eventBus
    if (bus && typeof bus.on === 'function') {
      bus.on('app:ready', () => {
        if (!ctx.searchManager) {
          const runtimeAdapter = ctx.getAdapter('search')
          if (runtimeAdapter) ctx.searchManager = new SearchManager(runtimeAdapter)
          try {
            ;(globalThis as any).searchManager = ctx.searchManager
            if (bus && typeof bus.emit === 'function') bus.emit('adapter:registered', { key: 'search' })
          } catch (e) {
            /* noop */
          }
        }
      })

      bus.on('adapter:registered', (payload: any) => {
        try {
          if (payload?.key === 'search' && !ctx.searchManager) {
            const runtimeAdapter = ctx.getAdapter('search')
            if (runtimeAdapter) ctx.searchManager = new SearchManager(runtimeAdapter)
              try {
                ;(globalThis as any).searchManager = ctx.searchManager
                if (bus && typeof bus.emit === 'function') bus.emit('adapter:registered', { key: 'search' })
              } catch (e) {
                /* noop */
              }
          }
        } catch (e) {
          /* noop */
        }
      })
    }
  }
}