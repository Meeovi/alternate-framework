import { registerQuery, registerMutation, registerSubscription } from './registry';
import * as productQueries from '../graphql/queries/products';
export function loadGraphQL() {
    // Register query documents from known modules.
    // This avoids relying on `import.meta.glob`, which is unavailable in
    // non-Vite runtimes (e.g. Nitro server execution).
    for (const key in productQueries) {
        registerQuery(key, productQueries[key]);
    }
    // Keep mutation/subscription registries initialized for future modules.
    void registerMutation;
    void registerSubscription;
}
