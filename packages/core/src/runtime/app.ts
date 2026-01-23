import { AlternateConfig } from '../types/config'
import { AlternateContext } from './context'
import { ModuleRegistry } from '../plugins/registry'
import { createEventBus } from '../types/events'
import { setRuntimeContext } from './hooks'
import { runAppLifecycle } from './lifecycle'
import type { AlternateApp, AlternateAppOptions } from '../types/app'

export function createAlternateApp(options: AlternateAppOptions): AlternateApp {
  const registry = new ModuleRegistry()
  const eventBus = createEventBus()
  const context = new AlternateContext(options.config, registry)

  setRuntimeContext(context, eventBus)

  options.modules?.forEach((mod) => registry.registerModule(mod, context))

  return {
    context,
    events: eventBus,
    async start() {
      await runAppLifecycle(registry, context, eventBus)
      return context
    }
  }
}