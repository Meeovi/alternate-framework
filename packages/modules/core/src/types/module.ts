import type { MFrameworkContext } from '../runtime/context'
import type { MFrameworkAdapterKey, MFrameworkAdapterOf } from './adapters'

export type MFrameworkModuleAdapters = Partial<{
  [K in MFrameworkAdapterKey]: MFrameworkAdapterOf<K>
}>

export interface MFrameworkModuleLifecycle {
  onAppInit?(ctx: MFrameworkContext): Promise<void> | void
  onBeforeRequest?(ctx: MFrameworkContext): Promise<void> | void
  onAfterRequest?(ctx: MFrameworkContext): Promise<void> | void
}

export interface MFrameworkModule extends MFrameworkModuleLifecycle {
  id: string
  adapters?: MFrameworkModuleAdapters
  setup?(ctx: MFrameworkContext): void | Promise<void>
}