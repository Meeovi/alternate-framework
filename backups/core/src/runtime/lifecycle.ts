import { MFrameworkContext } from './context'
import { ModuleRegistry } from '../plugins/registry'
import { MFrameworkEventBus } from '../types/events'

export async function runAppLifecycle(
  registry: ModuleRegistry,
  ctx: MFrameworkContext,
  bus: MFrameworkEventBus
) {
  // Example lifecycle sequence
  await registry.runLifecycle('onAppInit', ctx)

  bus.emit('app:ready', { context: ctx })
}


