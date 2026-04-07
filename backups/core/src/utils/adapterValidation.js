export function validateAdapterShape(adapter, domain) {
    if (!adapter.id) {
        throw new Error(`[@mframework/core] ${domain} adapter is missing "id"`);
    }
    if (!adapter.type) {
        throw new Error(`[@mframework/core] ${domain} adapter is missing "type"`);
    }
}
