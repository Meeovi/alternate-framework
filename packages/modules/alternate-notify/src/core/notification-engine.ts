import { TemplateRenderer } from '../ports/templates.js';
import {
  AddressStorage,
  NotificationLogStorage,
  PreferenceStorage
} from '../ports/storage.js';
import { NotifyEventBus } from '../ports/event-bus.js';
import { NotifyLogger } from '../ports/logger.js';
import { NotificationChannelAdapter } from '../ports/channels.js';
import { NotificationRequestedEvent } from '../domain/events.js';
import { NotificationPayload } from '../domain/types.js';
import { isChannelEnabled } from '../domain/preferences.js';

export interface NotificationEngineOptions {
  templates: TemplateRenderer;
  preferences: PreferenceStorage;
  addresses: AddressStorage;
  logStorage: NotificationLogStorage;
  eventBus: NotifyEventBus;
  logger: NotifyLogger;
  channels: NotificationChannelAdapter[];
}

export class NotificationEngine {
  private channelsByType: Map<string, NotificationChannelAdapter>;

  constructor(private readonly opts: NotificationEngineOptions) {
    this.channelsByType = new Map(
      opts.channels.map(ch => [ch.type, ch] as const)
    );
  }

  registerEventHandlers() {
    this.opts.eventBus.subscribe(
      'notification.requested',
      async event => this.handleRequested(event as NotificationRequestedEvent)
    );
  }

  private async handleRequested(event: NotificationRequestedEvent) {
    const { payload } = event;
    const { userId, templateKey, data, channels } = payload;

    const prefs = await this.opts.preferences.getUserPreferences(userId);
    const addresses = await this.opts.addresses.getUserAddresses(userId);

    if (!addresses) {
      this.opts.logger.warn('No addresses for user', { userId });
      return;
    }

    const rendered = await this.opts.templates.render({
      templateKey,
      data
    });

    const base: Omit<NotificationPayload, 'id' | 'channel'> = {
      userId,
      templateKey,
      data,
      metadata: payload.metadata,
      createdAt: new Date()
    };

    const targetChannels =
      channels ?? addresses.addresses.map(a => a.channel);

    for (const channel of targetChannels) {
      if (!isChannelEnabled(prefs, channel)) {
        this.opts.logger.debug('Channel disabled by preferences', {
          userId,
          channel
        });
        continue;
      }

      const adapter = this.channelsByType.get(channel);
      if (!adapter) {
        this.opts.logger.warn('No adapter for channel', { channel });
        continue;
      }

      const address = {
        userId,
        addresses: addresses.addresses.filter(a => a.channel === channel)
      };

      if (!address.addresses.length) {
        this.opts.logger.warn('No address for channel', { userId, channel });
        continue;
      }

      const notification: NotificationPayload = {
        ...base,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        channel
      };

      await this.opts.logStorage.logNotification(notification);

      try {
        const result = await adapter.send(notification, address);
        if (result.success) {
          await this.opts.eventBus.publish({
            type: 'notification.sent',
            occurredAt: new Date(),
            payload: {
              notificationId: notification.id,
              channel,
              provider: result.provider
            }
          });
        } else {
          await this.opts.eventBus.publish({
            type: 'notification.failed',
            occurredAt: new Date(),
            payload: {
              notificationId: notification.id,
              channel,
              provider: result.provider,
              error: result.error?.message ?? 'Unknown error'
            }
          });
        }
      } catch (error) {
        this.opts.logger.error('Notification send failed', {
          error,
          channel,
          userId
        });
        await this.opts.eventBus.publish({
          type: 'notification.failed',
          occurredAt: new Date(),
          payload: {
            notificationId: notification.id,
            channel,
            provider: 'unknown',
            error: (error as Error).message
          }
        });
      }
    }
  }
}
