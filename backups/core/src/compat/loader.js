// src/compat/loader.ts
/**
 * Default list of known compat modules.
 * Users can extend this via config later if they want.
 */
const KNOWN_COMPAT_MODULES = [
    '@m/compat-gridsome',
    '@m/compat-vuepress',
    '@m/compat-react',
];
export function loadCompatProviders(appRoot) {
    const providers = [];
    for (const mod of KNOWN_COMPAT_MODULES) {
        try {
            const resolved = require.resolve(mod, { paths: [appRoot] });
            const imported = require(resolved);
            const provider = imported.default || imported;
            if (!provider || !provider.name)
                continue;
            providers.push(provider);
        }
        catch {
            // Not installed in this app — silently skip
            continue;
        }
    }
    return providers;
}
/**
 * Helper to run a given hook on all providers, in order.
 */
export async function runCompatHook(providers, hook, ctx) {
    for (const provider of providers) {
        const fn = provider[hook];
        if (typeof fn === 'function') {
            await fn.call(provider, ctx);
        }
    }
}
/**
 * Helper to fold build config through all providers.
 */
export function foldBuildConfig(providers, initialConfig, ctx) {
    return providers.reduce((config, provider) => {
        if (typeof provider.extendBuildConfig === 'function') {
            return provider.extendBuildConfig(config, ctx);
        }
        return config;
    }, initialConfig);
}
