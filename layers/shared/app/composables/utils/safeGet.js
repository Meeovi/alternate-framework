export function safeGet(obj, key, fallback) {
    if (obj == null)
        return fallback;
    return obj[key] ?? fallback;
}
