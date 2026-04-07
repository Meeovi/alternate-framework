import { registerNamespacedQuery, registerNamespacedMutation, registerNamespacedSubscription } from './nsRegistry';
export function loadGraphQLNamespaced() {
    // queries
    const queryModules = import.meta.glob('../graphql/queries/**/*.ts', { eager: true });
    for (const path in queryModules) {
        const mod = queryModules[path];
        const namespace = path
            .replace('../graphql/queries/', '')
            .replace('.ts', '')
            .replace(/\//g, '.');
        for (const key in mod) {
            registerNamespacedQuery(namespace, key, mod[key]);
        }
    }
    // mutations
    const mutationModules = import.meta.glob('../graphql/mutations/**/*.ts', { eager: true });
    for (const path in mutationModules) {
        const mod = mutationModules[path];
        const namespace = path
            .replace('../graphql/mutations/', '')
            .replace('.ts', '')
            .replace(/\//g, '.');
        for (const key in mod) {
            registerNamespacedMutation(namespace, key, mod[key]);
        }
    }
    // subscriptions
    const subscriptionModules = import.meta.glob('../graphql/subscriptions/**/*.ts', { eager: true });
    for (const path in subscriptionModules) {
        const mod = subscriptionModules[path];
        const namespace = path
            .replace('../graphql/subscriptions/', '')
            .replace('.ts', '')
            .replace(/\//g, '.');
        for (const key in mod) {
            registerNamespacedSubscription(namespace, key, mod[key]);
        }
    }
}
