const providers = {};
export function registerChatProvider(name, provider) {
    providers[name] = provider;
}
export function getChatProvider(name) {
    const provider = providers[name];
    if (!provider)
        throw new Error(`Chat provider "${name}" not found`);
    return provider;
}
// Runtime helper for adapter packages to register themselves during app boot
export function registerChatProviderRuntime(name, provider) {
    registerChatProvider(name, provider);
}
