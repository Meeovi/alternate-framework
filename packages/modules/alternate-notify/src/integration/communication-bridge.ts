import { NotifyEventBus } from '../ports/event-bus.js';
import { NotificationDispatcher } from '../core/dispatcher.js';

export interface CommunicationEvent {
  type:
    | 'communication.message.created'
    | 'communication.user.mentioned'
    | 'communication.room.invited';
  payload: Record<string, unknown>;
}

export interface CommunicationBridgeOptions {
  dispatcher: NotificationDispatcher;
  mapEventToNotification: (
    event: CommunicationEvent
  ) =>
    | {
        userId: string;
        templateKey: string;
        data: Record<string, unknown>;
        channels?: ('email' | 'sms' | 'push' | 'webhook' | 'in_app')[];
      }
    | null;
}

export class CommunicationBridge {
  constructor(
    private readonly bus: NotifyEventBus,
    private readonly opts: CommunicationBridgeOptions
  ) {}

  register() {
    this.bus.subscribe('notification.sent', async () => {
      // no-op, but you could wire back into communication if needed
    });
  }

  async handleCommunicationEvent(event: CommunicationEvent) {
    const mapped = this.opts.mapEventToNotification(event);
    if (!mapped) return;
    await this.opts.dispatcher.dispatch(mapped);
  }
}
