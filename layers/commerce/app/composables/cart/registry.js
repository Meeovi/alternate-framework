const providers = {};
export function registerCartProvider(name, provider) {
    providers[name] = provider;
}
export function getCartProvider(name) {
    const provider = providers[name];
    if (!provider)
        throw new Error(`Cart provider "${name}" not found`);
    return provider;
}
// Runtime helper for adapter packages to register themselves when the
// app boots. Adapter packages can import this and call it from their
// plugin entry to wire into the commerce cart provider registry.
export function registerCartProviderRuntime(name, provider) {
    registerCartProvider(name, provider);
}
