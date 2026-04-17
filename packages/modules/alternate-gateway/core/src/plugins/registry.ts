import type {
    MFrameworkModule
} from '../types/module';
import { MFrameworkContext } from '../runtime/context'
import type {
    MFrameworkAdapterKey,
    MFrameworkAdapterMap,
    MFrameworkAdapterOf
} from '../types/adapters';
import type {
    MFrameworkEventBus
} from '../types/events';

export class ModuleRegistry {
  private modules = new Map<string, MFrameworkModule>()
  private adapters = new Map<MFrameworkAdapterKey, MFrameworkAdapterMap[MFrameworkAdapterKey]>()
  private bus: MFrameworkEventBus | null = null

  constructor(bus?: MFrameworkEventBus) {
    if (bus) this.bus = bus
  }

  registerModule(module: MFrameworkModule, ctx: MFrameworkContext) {
    if (this.modules.has(module.id)) return

    this.modules.set(module.id, module)
    if (module.adapters) {
      for (const [key, adapter] of Object.entries(module.adapters)) {
        const typedKey = key as MFrameworkAdapterKey
        this.registerAdapter(typedKey, adapter as MFrameworkAdapterMap[typeof typedKey])
      }
    }
    module.setup?.(ctx)
  }

  getAdapter<K extends MFrameworkAdapterKey>(key: K): MFrameworkAdapterOf<K> | undefined {
    return this.adapters.get(key) as MFrameworkAdapterOf<K> | undefined
  }

  // Register an adapter at runtime. Emits `adapter:registered` so modules
  // depending on adapters can react when new adapters become available.
  registerAdapter<K extends MFrameworkAdapterKey>(key: K, adapter: MFrameworkAdapterMap[K]) {
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

  async runLifecycle(hook: keyof MFrameworkModule, ctx: MFrameworkContext) {
    for (const module of this.modules.values()) {
      const fn = module[hook]
      if (typeof fn === 'function') {
        await fn.call(module, ctx)
      }
    }
  }
}