export interface AlternateEventMap {
  'app:ready': { context: unknown }
  'app:error': { error: unknown }
  // modules extend this via declaration merging
}

export type AlternateEventKey = keyof AlternateEventMap

export type AlternateEventHandler<K extends AlternateEventKey> = (
  payload: AlternateEventMap[K]
) => void | Promise<void>

export interface AlternateEventBus {
  on<K extends AlternateEventKey>(event: K, handler: AlternateEventHandler<K>): void
  off<K extends AlternateEventKey>(event: K, handler: AlternateEventHandler<K>): void
  emit<K extends AlternateEventKey>(event: K, payload: AlternateEventMap[K]): Promise<void>
}

export function createEventBus(): AlternateEventBus {
  const handlers = new Map<string, Set<AlternateEventHandler<any>>>()

  return {
    on(event, handler) {
      if (!handlers.has(event)) {
        handlers.set(event, new Set())
      }
      handlers.get(event)!.add(handler as AlternateEventHandler<any>)
    },

    off(event, handler) {
      handlers.get(event)?.delete(handler as AlternateEventHandler<any>)
    },

    async emit(event, payload) {
      const set = handlers.get(event)
      if (!set || set.size === 0) return

      for (const handler of set) {
        await handler(payload as any)
      }
    }
  }
}