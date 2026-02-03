import { AlternateContext } from './context'
import { ModuleRegistry } from '../plugins/registry'
import { AlternateEventBus } from '../types/events'

export async function runAppLifecycle(
  registry: ModuleRegistry,
  ctx: AlternateContext,
  bus: AlternateEventBus
) {
  // Example lifecycle sequence
  await registry.runLifecycle('onAppInit', ctx)

  bus.emit('app:ready', { context: ctx })
}


