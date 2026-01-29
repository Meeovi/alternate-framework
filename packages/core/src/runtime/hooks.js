let currentContext = null;
let currentEventBus = null;
export function setRuntimeContext(ctx, bus) {
    currentContext = ctx;
    currentEventBus = bus;
}
export function useAlternateContext() {
    if (!currentContext) {
        throw new Error('[@meeovi/core] useAlternateContext() called before app initialization');
    }
    return currentContext;
}
export function useAlternateEventBus() {
    if (!currentEventBus) {
        throw new Error('[@meeovi/core] useAlternateEventBus() called before app initialization');
    }
    return currentEventBus;
}
