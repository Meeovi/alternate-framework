import { Novu } from '@novu/api';
import { CommunicationNotificationAdapter, NotifyNewMessageInput } from '../../src/ports/notifications';

export interface NovuNotificationAdapterOptions {
  apiKey: string;
  workflowId: string; // e.g. "new-message"
}

export function createNovuNotificationAdapter(
  options: NovuNotificationAdapterOptions
): CommunicationNotificationAdapter {
  const novu = new Novu(options.apiKey);

  return {
    async notifyNewMessage(input: NotifyNewMessageInput): Promise<void> {
      const { message, room, recipients } = input;

      for (const userId of recipients) {
        await novu.trigger(options.workflowId, {
          to: { subscriberId: userId },
          payload: {
            messageId: message.id,
            roomId: room.id,
            body: message.body,
            senderId: message.userId,
            createdAt: message.createdAt
          }
        });
      }
    }
  };
}
