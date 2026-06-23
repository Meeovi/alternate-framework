import { NotifyEvent } from '../domain/events.js';

export interface NotifyEventBus {
  publish(event: NotifyEvent): Promise<void>;
  subscribe(
    type: NotifyEvent['type'],
    handler: (event: NotifyEvent) => Promise<void> | void
  ): void;
}
