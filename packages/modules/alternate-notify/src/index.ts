export * from './domain/types.js';
export * from './domain/events.js';
export * from './domain/preferences.js';

export * from './ports/channels.js';
export * from './ports/templates.js';
export * from './ports/event-bus.js';
export * from './ports/logger.js';
export * from './ports/storage.js';

export * from './core/notification-engine.js';
export * from './core/dispatcher.js';
export * from './core/preference-service.js';

export * from './adapters/templates/handlebars.js';
export * from './adapters/email/sendgrid.js';
export * from './adapters/sms/twilio.js';
export * from './adapters/push/fcm.js';
export * from './adapters/webhook/webhook.js';
export * from './adapters/storage/in-memory.js';
export * from './adapters/logger/console.js';

export * from './integration/communication-bridge.js';
export * from './integration/events.js';

export * from './runtime/production.js';
export * from './runtime/testing.js';
export * from './config.js';
