import { AlternateModule } from '../types/module'
import { AlternateContext } from '../runtime/context'
import {
  AlternateAdapterKey,
  AlternateAdapterMap,
  AlternateAdapterOf
} from '../types/adapters'

export class ModuleRegistry {
  private modules = new Map<string, AlternateModule>()
  private adapters = new Map<AlternateAdapterKey, AlternateAdapterMap[AlternateAdapterKey]>()

  registerModule(module: AlternateModule, ctx: AlternateContext) {
    if (this.modules.has(module.id)) return

    this.modules.set(module.id, module)

    if (module.adapters) {
      for (const [key, adapter] of Object.entries(module.adapters)) {
        const typedKey = key as AlternateAdapterKey
        this.adapters.set(typedKey, adapter as AlternateAdapterMap[typeof typedKey])
      }
    }

    module.setup?.(ctx)
  }

  getAdapter<K extends AlternateAdapterKey>(key: K): AlternateAdapterOf<K> | undefined {
    return this.adapters.get(key) as AlternateAdapterOf<K> | undefined
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