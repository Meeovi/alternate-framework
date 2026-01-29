const metrics = new Map();
function getProviderMetrics(provider) {
    if (!metrics.has(provider)) {
        metrics.set(provider, {
            requests: 0,
            successes: 0,
            failures: 0,
            cacheHits: 0,
            cacheMisses: 0,
            backgroundRefreshes: 0
        });
    }
    return metrics.get(provider);
}
export function recordRequest(provider) {
    getProviderMetrics(provider).requests++;
}
export function recordSuccess(provider) {
    getProviderMetrics(provider).successes++;
}
export function recordFailure(provider) {
    getProviderMetrics(provider).failures++;
}
export function recordCacheHit(provider) {
    getProviderMetrics(provider).cacheHits++;
}
export function recordCacheMiss(provider) {
    getProviderMetrics(provider).cacheMisses++;
}
export function recordBackgroundRefresh(provider) {
    getProviderMetrics(provider).backgroundRefreshes++;
}
export function getMetrics(provider) {
    return getProviderMetrics(provider);
}
