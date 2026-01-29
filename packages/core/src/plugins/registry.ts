import { AlternateModule } from '../types/module'
import { AlternateContext } from '../runtime/context'
import {
  AlternateAdapterKey,
  AlternateAdapterMap,
  AlternateAdapterOf
} from '../types/adapters'
import { AlternateEventBus } from '../types/events'

export class ModuleRegistry {
  private modules = new Map<string, AlternateModule>()
  private adapters = new Map<AlternateAdapterKey, AlternateAdapterMap[AlternateAdapterKey]>()
  private bus: AlternateEventBus | null = null

  constructor(bus?: AlternateEventBus) {
    if (bus) this.bus = bus
  }

  registerModule(module: AlternateModule, ctx: AlternateContext) {
    if (this.modules.has(module.id)) return

    this.modules.set(module.id, module)
    if (module.adapters) {
      for (const [key, adapter] of Object.entries(module.adapters)) {
        const typedKey = key as AlternateAdapterKey
        this.registerAdapter(typedKey, adapter as AlternateAdapterMap[typeof typedKey])
      }
    }
    module.setup?.(ctx)
  }

  getAdapter<K extends AlternateAdapterKey>(key: K): AlternateAdapterOf<K> | undefined {
    return this.adapters.get(key) as AlternateAdapterOf<K> | undefined
  }

  // Register an adapter at runtime. Emits `adapter:registered` so modules
  // depending on adapters can react when new adapters become available.
  registerAdapter<K extends AlternateAdapterKey>(key: K, adapter: AlternateAdapterMap[K]) {
    this.adapters.set(key, adapter)
    if (this.bus) {
      try {
        // notify listeners asynchronously
        this.bus.emit('adapter:registered', { key } as any).catch(() => {})
      } catch (e) {
        // ignore emit errors
      }
    }
  }

  async runLifecycle(hook: keyof AlternateModule, ctx: AlternateContext) {
    for (const module of this.modules.values()) {
      const fn = module[hook]
      if (typeof fn === 'function') {
        await fn.call(module, ctx)
      }
    }
  }
}