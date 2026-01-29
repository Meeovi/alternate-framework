const providers = {};
export function registerContentProvider(name, provider) {
    providers[name] = provider;
}
export function getContentProvider(name) {
    const provider = providers[name];
    if (!provider)
        throw new Error(`Content provider "${name}" not found`);
    return provider;
}
