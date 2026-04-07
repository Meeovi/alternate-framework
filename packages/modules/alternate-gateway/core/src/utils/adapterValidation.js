export function validateAdapterShape(adapter, domain) {
    if (!adapter.id) {
        throw new Error(`[alternate-gateway/core] ${domain} adapter is missing "id"`);
    }
    if (!adapter.type) {
        throw new Error(`[alternate-gateway/core] ${domain} adapter is missing "type"`);
    }
}
