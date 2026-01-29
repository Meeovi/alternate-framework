import { getSocialCache } from './cache';
const refreshQueue = new Map();
export function scheduleBackgroundRefresh(key, fn, ttlMs) {
    if (refreshQueue.has(key))
        return;
    const promise = fn()
        .then((fresh) => {
        const cache = getSocialCache();
        cache.set(key, fresh, ttlMs);
    })
        .finally(() => {
        refreshQueue.delete(key);
    });
    refreshQueue.set(key, promise);
}
