export function validateSearchConfig(config) {
    if (!config.defaultProvider) {
        throw new Error('[@meeovi/search] Missing defaultProvider');
    }
    if (!config.providers[config.defaultProvider]) {
        throw new Error(`[@meeovi/search] Provider "${config.defaultProvider}" not found in config.providers`);
    }
}
