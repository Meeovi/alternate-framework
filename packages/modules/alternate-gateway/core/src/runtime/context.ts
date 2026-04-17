import type {
    MFrameworkConfig
} from '../types/config';
import { ModuleRegistry } from '../plugins/registry'
import type {
    MFrameworkAdapterKey,
    MFrameworkAdapterOf
} from '../types/adapters';

export class MFrameworkContext {
  readonly config: MFrameworkConfig
  readonly modules: ModuleRegistry

  constructor(config: MFrameworkConfig, modules: ModuleRegistry) {
    this.config = config
    this.modules = modules
  }

  getAdapter<K extends MFrameworkAdapterKey>(key: K): MFrameworkAdapterOf<K> | undefined {
    return this.modules.getAdapter<K>(key)
  }
}

