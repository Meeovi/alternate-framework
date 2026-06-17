import { CommunicationNotificationAdapter, NotifyNewMessageInput } from '../../src/ports/notifications';

export interface WebhookNotificationAdapterOptions {
  url: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export function createWebhookNotificationAdapter(
  options: WebhookNotificationAdapterOptions
): CommunicationNotificationAdapter {
  return {
    async notifyNewMessage(input: NotifyNewMessageInput): Promise<void> {
      await fetch(options.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers ?? {})
        },
        body: JSON.stringify({
          event: 'message.created',
          message: input.message,
          room: input.room,
          recipients: input.recipients
        }),
        signal: AbortSignal.timeout(options.timeoutMs ?? 5000)
      });
    }
  };
}
