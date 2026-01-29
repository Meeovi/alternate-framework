const providers = {};
let activeProvider = null;
export function registerAuthProvider(name, provider) {
    providers[name] = provider;
}
export function setActiveAuthProvider(name) {
    if (!providers[name]) {
        throw new Error(`Auth provider "${name}" is not registered`);
    }
    activeProvider = name;
}
export function getAuthProvider() {
    if (!activeProvider) {
        throw new Error('No active auth provider has been set');
    }
    return providers[activeProvider];
}
