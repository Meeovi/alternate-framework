import { NotificationEngine } from '../core/notification-engine.js';
import { NotificationDispatcher } from '../core/dispatcher.js';
import { HandlebarsTemplateRenderer } from '../adapters/templates/handlebars.js';
import {
  InMemoryAddressStorage,
  InMemoryNotificationLogStorage,
  InMemoryPreferenceStorage
} from '../adapters/storage/in-memory.js';
import { ConsoleLogger } from '../adapters/logger/console.js';
import { SendgridEmailAdapter } from '../adapters/email/sendgrid.js';
import { TwilioSmsAdapter } from '../adapters/sms/twilio.js';
import { FcmPushAdapter } from '../adapters/push/fcm.js';
import { WebhookAdapter } from '../adapters/webhook/webhook.js';
import { NotifyEventBus } from '../ports/event-bus.js';
import { NotifyEvent } from '../domain/events.js';

class InMemoryEventBus implements NotifyEventBus {
  handlers: {
    [K in NotifyEvent['type']]?: ((event: NotifyEvent) => Promise<void> | void)[];
  } = {};

  async publish(event: NotifyEvent): Promise<void> {
    const handlers = this.handlers[event.type] ?? [];
    for (const h of handlers) await h(event);
  }

  subscribe(
    type: NotifyEvent['type'],
    handler: (event: NotifyEvent) => Promise<void> | void
  ): void {
    if (!this.handlers[type]) this.handlers[type] = [];
    this.handlers[type]!.push(handler);
  }
}

export function createProductionNotificationModule() {
  const templates = new HandlebarsTemplateRenderer({
    'communication.new-message': {
      subject: 'New message from {{senderName}}',
      text: '{{senderName}}: {{snippet}}',
      html: '<p><strong>{{senderName}}</strong>: {{snippet}}</p>'
    }
  });

  const preferences = new InMemoryPreferenceStorage();
  const addresses = new InMemoryAddressStorage();
  const logStorage = new InMemoryNotificationLogStorage();
  const eventBus = new InMemoryEventBus();
  const logger = new ConsoleLogger();

  const channels = [
    new SendgridEmailAdapter({
      apiKey: process.env.SENDGRID_API_KEY ?? '',
      fromEmail: 'no-reply@example.com',
      fromName: 'Notifications'
    }),
    new TwilioSmsAdapter({
      accountSid: process.env.TWILIO_SID ?? '',
      authToken: process.env.TWILIO_TOKEN ?? '',
      fromNumber: process.env.TWILIO_FROM ?? ''
    }),
    new FcmPushAdapter({
      serverKey: process.env.FCM_SERVER_KEY ?? ''
    }),
    new WebhookAdapter({})
  ];

  const engine = new NotificationEngine({
    templates,
    preferences,
    addresses,
    logStorage,
    eventBus,
    logger,
    channels
  });

  engine.registerEventHandlers();

  const dispatcher = new NotificationDispatcher(eventBus);

  return {
    engine,
    dispatcher,
    eventBus,
    preferences,
    addresses,
    logStorage
  };
}
