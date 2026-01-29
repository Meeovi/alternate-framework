const providers = {};
export function registerListsProvider(name, provider) {
    providers[name] = provider;
}
// Allow runtime registration from other modules (e.g. via core ModuleRegistry adapters)
export function registerListsProviderRuntime(name, provider) {
    registerListsProvider(name, provider);
}
export function getListsProvider(name) {
    const provider = providers[name];
    if (!provider)
        throw new Error(`Lists provider "${name}" not found`);
    return provider;
}
