const registry = {};
export const setTransport = (adapter) => {
    registry.transport = adapter;
};
export const setAuthAdapter = (adapter) => {
    registry.auth = adapter;
};
export const setCommerceAdapter = (adapter) => {
    registry.commerce = adapter;
};
export const setSearchAdapter = (adapter) => {
    registry.search = adapter;
};
export const getRegistry = () => {
    if (!registry.transport) {
        throw new Error('Transport adapter not set');
    }
    return registry;
};
