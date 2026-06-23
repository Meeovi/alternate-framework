import type { AlternateEvent, AlternateEventType } from './event-types';

export type EventHandler = (event: AlternateEvent) => void | Promise<void>;

export class EventBus {
  #handlers: Record<AlternateEventType, EventHandler[]> = {} as any;

  publish(event: AlternateEvent): Promise<void> {
    const handlers = this.#handlers[event.type] ?? [];
    return Promise.all(handlers.map(h => h(event))).then(() => undefined);
  }

  subscribe(type: AlternateEventType, handler: EventHandler): void {
    if (!this.#handlers[type]) {
      this.#handlers[type] = [];
    }
    this.#handlers[type]!.push(handler);
  }
}

// Singleton instance
export const eventBus = new EventBus();
