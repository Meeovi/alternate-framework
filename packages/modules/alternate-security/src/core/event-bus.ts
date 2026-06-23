import type { SecurityEvent, SecurityEventType } from '../domain/events.js';

export interface EventBusSubscriber {
  (event: SecurityEvent): void | Promise<void>;
}

export class EventBus {
  #handlers: Record<SecurityEventType, EventBusSubscriber[]> = {} as any;

  async publish(event: SecurityEvent): Promise<void> {
    const handlers = this.#handlers[event.type] ?? [];
    for (const handler of handlers) {
      await handler(event);
    }
  }

  subscribe(type: SecurityEventType, handler: EventBusSubscriber): void {
    if (!this.#handlers[type]) {
      this.#handlers[type] = [];
    }
    this.#handlers[type]!.push(handler);
  }
}
