import { AlternateConfig } from '../types/config'
import { ModuleRegistry } from '../plugins/registry'
import { AlternateAdapterKey, AlternateAdapterOf } from '../types/adapters'

export class AlternateContext {
  readonly config: AlternateConfig
  readonly modules: ModuleRegistry

  constructor(config: AlternateConfig, modules: ModuleRegistry) {
    this.config = config
    this.modules = modules
  }

  getAdapter<K extends AlternateAdapterKey>(key: K): AlternateAdapterOf<K> | undefined {
    return this.modules.getAdapter<K>(key)
  }
}