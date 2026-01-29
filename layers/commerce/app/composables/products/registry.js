const providers = {};
export function registerProductProvider(name, provider) {
    providers[name] = provider;
}
export function getProductProvider(name) {
    const provider = providers[name];
    if (!provider)
        throw new Error(`Product provider "${name}" not found`);
    return provider;
}
// Runtime helper for adapter packages to register themselves when the
// app boots. Adapter packages can import this and call it from their
// plugin entry to wire into the commerce product provider registry.
export function registerProductProviderRuntime(name, provider) {
    registerProductProvider(name, provider);
}
