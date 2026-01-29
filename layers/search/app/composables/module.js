import { defineAlternateModule, useAlternateEventBus } from '@meeovi/core';
import { validateSearchConfig } from './config/schema';
import { createOpenSearchAdapter } from './adapter/opensearch';
import { createMeilisearchAdapter } from './adapter/meilisearch';
import { SearchManager } from './core/SearchManager';
export default defineAlternateModule({
    id: 'search',
    adapters: {},
    async setup(ctx) {
        const bus = useAlternateEventBus();
        const config = ctx.config.search;
        if (!config)
            return;
        validateSearchConfig(config);
        if (config.defaultProvider === 'opensearch') {
            const providerConfig = config.providers.opensearch;
            if (providerConfig) {
                this.adapters = {
                    search: createOpenSearchAdapter(providerConfig)
                };
            }
        }
        if (config.defaultProvider === 'meilisearch') {
            const providerConfig = config.providers.meilisearch;
            if (providerConfig) {
                this.adapters = {
                    search: createMeilisearchAdapter(providerConfig)
                };
            }
        }
        const adapter = ctx.getAdapter('search');
        if (adapter) {
            ctx.searchManager = new SearchManager(adapter);
        }
        // Ensure search manager exists now if adapter already registered
        if (!ctx.searchManager && ctx.getAdapter('search')) {
            const runtimeAdapter = ctx.getAdapter('search');
            if (runtimeAdapter) {
                ctx.searchManager = new SearchManager(runtimeAdapter);
            }
        }
        // Listen for app readiness and for runtime adapter registrations so
        // new adapters (registered by other modules) will auto-create the
        // search manager when they become available.
        bus.on('app:ready', () => {
            if (!ctx.searchManager) {
                const runtimeAdapter = ctx.getAdapter('search');
                if (runtimeAdapter) {
                    ctx.searchManager = new SearchManager(runtimeAdapter);
                }
            }
            console.info('[@meeovi/search] Search module initialized');
        });
        // Optional runtime event: if other modules emit `adapter:registered`
        // with a `{ key }` payload, respond and initialize when the `search`
        // adapter becomes available.
        // This is defensive — the core registry does not emit this by default,
        // but some runtimes may choose to.
        bus.on('adapter:registered', (payload) => {
            try {
                if (payload?.key === 'search' && !ctx.searchManager) {
                    const runtimeAdapter = ctx.getAdapter('search');
                    if (runtimeAdapter) {
                        ctx.searchManager = new SearchManager(runtimeAdapter);
                    }
                }
            }
            catch (e) {
                /* noop */
            }
        });
    }
});
