let cache = {
    store: new Map(),
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    },
    set(key, value, ttlMs) {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs
        });
    },
    delete(key) {
        this.store.delete(key);
    }
};
export function setSocialCache(customCache) {
    cache = customCache;
}
export function getSocialCache() {
    return cache;
}
