import { NotifyEventBus } from '../ports/event-bus.js';
import { NotificationRequestedEvent } from '../domain/events.js';

export interface DispatchNotificationInput {
  userId: string;
  templateKey: string;
  data: Record<string, unknown>;
  channels?: ('email' | 'sms' | 'push' | 'webhook' | 'in_app')[];
  metadata?: Record<string, unknown>;
}

export class NotificationDispatcher {
  constructor(private readonly bus: NotifyEventBus) {}

  async dispatch(input: DispatchNotificationInput): Promise<void> {
    const event: NotificationRequestedEvent = {
      type: 'notification.requested',
      occurredAt: new Date(),
      payload: {
        userId: input.userId,
        templateKey: input.templateKey,
        data: input.data,
        channels: input.channels,
        metadata: input.metadata
      }
    };

    await this.bus.publish(event);
  }
}
