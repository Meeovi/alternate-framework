import { AlternateContext } from './context';
import { ModuleRegistry } from '../plugins/registry';
import { createEventBus } from '../types/events';
import { setRuntimeContext } from './hooks';
import { runAppLifecycle } from './lifecycle';
export function createAlternateApp(options) {
    const eventBus = createEventBus();
    const registry = new ModuleRegistry(eventBus);
    const context = new AlternateContext(options.config, registry);
    setRuntimeContext(context, eventBus);
    options.modules?.forEach((mod) => registry.registerModule(mod, context));
    return {
        context,
        events: eventBus,
        async start() {
            await runAppLifecycle(registry, context, eventBus);
            return context;
        }
    };
}
