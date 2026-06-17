export function createEventBus() {
  const listeners = new Map<string, Set<(payload: any) => void>>();

  return {
    on(event: string, handler: (payload: any) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
    },

    off(event: string, handler: (payload: any) => void) {
      listeners.get(event)?.delete(handler);
    },

    emit(event: string, payload: any) {
      listeners.get(event)?.forEach(fn => fn(payload));
    }
  };
}

export const clientEventBus = createEventBus();
