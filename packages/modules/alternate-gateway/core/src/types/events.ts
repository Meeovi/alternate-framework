import { MFrameworkAdapterKey } from './adapters'

export interface MFrameworkEventMap {
  'app:ready': { context: unknown }
  'app:error': { error: unknown }
  // emitted when a module/registry registers an adapter at runtime
  'adapter:registered': { key: MFrameworkAdapterKey }
  // modules extend this via declaration merging
}

export type MFrameworkEventKey = keyof MFrameworkEventMap

export type MFrameworkEventHandler<K extends MFrameworkEventKey> = (
  payload: MFrameworkEventMap[K]
) => void | Promise<void>

export interface MFrameworkEventBus {
  on<K extends MFrameworkEventKey>(event: K, handler: MFrameworkEventHandler<K>): void
  off<K extends MFrameworkEventKey>(event: K, handler: MFrameworkEventHandler<K>): void
  emit<K extends MFrameworkEventKey>(event: K, payload: MFrameworkEventMap[K]): Promise<void>
}

export function createEventBus(): MFrameworkEventBus {
  const handlers = new Map<string, Set<MFrameworkEventHandler<any>>>()

  return {
    on(event, handler) {
      if (!handlers.has(event)) {
        handlers.set(event, new Set())
      }
      handlers.get(event)!.add(handler as MFrameworkEventHandler<any>)
    },

    off(event, handler) {
      handlers.get(event)?.delete(handler as MFrameworkEventHandler<any>)
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