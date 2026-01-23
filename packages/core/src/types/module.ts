import type { AlternateContext } from '../runtime/context'
import type { AlternateAdapterKey, AlternateAdapterOf } from './adapters'

export type AlternateModuleAdapters = Partial<{
  [K in AlternateAdapterKey]: AlternateAdapterOf<K>
}>

export interface AlternateModuleLifecycle {
  onAppInit?(ctx: AlternateContext): Promise<void> | void
  onBeforeRequest?(ctx: AlternateContext): Promise<void> | void
  onAfterRequest?(ctx: AlternateContext): Promise<void> | void
}

export interface AlternateModule extends AlternateModuleLifecycle {
  id: string
  adapters?: AlternateModuleAdapters
  setup?(ctx: AlternateContext): void | Promise<void>
}