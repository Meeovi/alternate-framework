import { createAlternateApp } from '../../../packages/core/src/runtime/app';
import { defineAlternateAdapter } from '../../../packages/core/src/plugins/defineAdapter';
import { defineAlternateModule } from '../../../packages/core/src/plugins/defineModule';
import { AlternateContext } from '../../../packages/core/src/runtime/context';
import { ModuleRegistry } from '../../../packages/core/src/plugins/registry';
import { createEventBus } from '../../../packages/core/src/types/events';
// Minimal mock search adapter shape matching core types
const mockSearchAdapter = defineAlternateAdapter({
    id: 'mock-search',
    type: 'search',
    async search() {
        return { items: [], total: 0, page: 1, pageSize: 10 };
    }
});
// A tiny test runner substitute so this file can be executed with `ts-node` or similar.
async function run() {
    // Build an app with no modules initially
    const app = createAlternateApp({ config: { modules: [] }, modules: [] });
    // Create event bus and registry manually to inspect behavior
    const bus = createEventBus();
    const registry = new ModuleRegistry(bus);
    const ctx = new AlternateContext({}, registry);
    // Register the search module implementation directly (import existing module)
    const searchModule = require('../app/composables/module').default;
    registry.registerModule(searchModule, ctx);
    // At this point no adapter is registered yet, so searchManager should be undefined
    if (ctx.searchManager) {
        throw new Error('Expected searchManager to be undefined before adapter registration');
    }
    // Now register a module that provides the adapter
    const providerModule = defineAlternateModule({
        id: 'provider',
        adapters: {
            search: mockSearchAdapter
        },
        setup() { }
    });
    registry.registerModule(providerModule, ctx);
    // After registration, registry should have emitted adapter:registered and search module
    // should have created the SearchManager
    if (!ctx.searchManager) {
        throw new Error('Expected searchManager to be initialized after adapter registration');
    }
    console.log('OK: searchManager initialized on adapter registration');
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
