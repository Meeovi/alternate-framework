let currentContext = null;
let currentEventBus = null;
export function setRuntimeContext(ctx, bus) {
    currentContext = ctx;
    currentEventBus = bus;
}
export function useMFrameworkContext() {
    if (!currentContext) {
        throw new Error('[alternate-gateway/core] useMFrameworkContext() called before app initialization');
    }
    return currentContext;
}
export function useMFrameworkEventBus() {
    if (!currentEventBus) {
        throw new Error('[alternate-gateway/core] useMFrameworkEventBus() called before app initialization');
    }
    return currentEventBus;
}
export function useRuntimeConfig() {
    return useMFrameworkContext().config;
}
