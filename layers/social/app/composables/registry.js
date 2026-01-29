const providers = {};
export function registerSocialProvider(name, provider) {
    providers[name] = provider;
}
// Runtime helper for adapter packages to register themselves when the
// app boots. Adapter packages can import this and call it from their
// plugin entry to wire into the social layer at runtime.
export function registerSocialProviderRuntime(name, provider) {
    registerSocialProvider(name, provider);
}
export function getSocialProvider(name) {
    const provider = providers[name];
    if (!provider)
        throw new Error(`Social provider "${name}" not found`);
    return provider;
}
