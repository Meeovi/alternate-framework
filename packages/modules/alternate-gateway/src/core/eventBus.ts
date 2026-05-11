type EventHandler<T = unknown> = (payload: T) => void

export interface EventBus<Events extends Record<string, unknown> = Record<string, unknown>> {
  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void
  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void
  emit<K extends keyof Events>(event: K, payload: Events[K]): void
  clear(): void
}

export function createEventBus<
  Events extends Record<string, unknown> = Record<string, unknown>
>(): EventBus<Events> {
  const handlers = new Map<keyof Events, Set<EventHandler>>()

  function on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>) {
    if (!handlers.has(event)) {
      handlers.set(event, new Set())
    }
    handlers.get(event)!.add(handler as EventHandler)
  }

  function off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>) {
    handlers.get(event)?.delete(handler as EventHandler)
  }

  function emit<K extends keyof Events>(event: K, payload: Events[K]) {
    handlers.get(event)?.forEach((handler) => handler(payload))
  }

  function clear() {
    handlers.clear()
  }

  return { on, off, emit, clear }
}
