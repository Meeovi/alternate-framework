const providers = {};
export function registerMediaProvider(name, provider) {
    providers[name] = provider;
}
export function getMediaProvider(name) {
    const provider = providers[name];
    if (!provider)
        throw new Error(`Media provider "${name}" not found`);
    return provider;
}
