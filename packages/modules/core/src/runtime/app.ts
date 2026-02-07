import { MFrameworkConfig } from '../types/config'
import { MFrameworkContext } from './context'
import { ModuleRegistry } from '../plugins/registry'
import { createEventBus } from '../types/events'
import type { MFrameworkEventBus } from '../types/events'
import { setRuntimeContext } from './hooks'
import { runAppLifecycle } from './lifecycle'
import type { MFrameworkApp, MFrameworkAppOptions } from '../types/app'

export function createMFrameworkApp(options: MFrameworkAppOptions): MFrameworkApp {
  const eventBus: MFrameworkEventBus = createEventBus()
  const registry = new ModuleRegistry(eventBus)
  const context = new MFrameworkContext(options.config, registry)

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

export type { MFrameworkAppOptions }
export type { MFrameworkApp }
export type { MFrameworkConfig }
