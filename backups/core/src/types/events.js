export function createEventBus() {
    const handlers = new Map();
    return {
        on(event, handler) {
            if (!handlers.has(event)) {
                handlers.set(event, new Set());
            }
            handlers.get(event).add(handler);
        },
        off(event, handler) {
            handlers.get(event)?.delete(handler);
        },
        async emit(event, payload) {
            const set = handlers.get(event);
            if (!set || set.size === 0)
                return;
            for (const handler of set) {
                await handler(payload);
            }
        }
    };
}
