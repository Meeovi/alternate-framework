import { NotificationChannelAdapter, ChannelSendResult } from '../../ports/channels.js';
import { NotificationPayload, UserChannelAddresses } from '../../domain/types.js';
import fetch from 'node-fetch';

export interface WebhookAdapterOptions {
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
}

export class WebhookAdapter implements NotificationChannelAdapter {
  readonly type = 'webhook' as const;

  constructor(private readonly opts: WebhookAdapterOptions = {}) {}

  async send(
    payload: NotificationPayload,
    address: UserChannelAddresses
  ): Promise<ChannelSendResult> {
    const url = address.addresses[0]?.address;
    if (!url) {
      return {
        success: false,
        provider: 'webhook',
        error: new Error('No webhook URL')
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        this.opts.timeoutMs ?? 5000
      );

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.opts.defaultHeaders ?? {})
        },
        body: JSON.stringify({
          event: 'notification',
          payload
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      return {
        success: res.ok,
        provider: 'webhook'
      };
    } catch (error) {
      return {
        success: false,
        provider: 'webhook',
        error: error as Error
      };
    }
  }
}
