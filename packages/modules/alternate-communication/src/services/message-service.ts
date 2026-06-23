import { eventBus } from '@mframework/alternate-events';

export class MessageService {
  repo: any;
  async createMessage({ senderId, roomId, text }: {
    senderId: string;
    roomId: string;
    text: string;
  }) {
    const message = await this.repo.create({ senderId, roomId, text });

    await eventBus.publish({
      type: 'communication.message.created',
      occurredAt: new Date(),
      payload: {
        messageId: message.id,
        senderId,
        roomId,
        snippet: text.slice(0, 120)
      }
    });

    return message;
  }

  async notifyMention({ messageId, mentionedUserId, roomId }: {
    messageId: string;
    mentionedUserId: string;
    roomId: string;
  }) {
    await eventBus.publish({
      type: 'communication.user.mentioned',
      occurredAt: new Date(),
      payload: {
        messageId,
        mentionedUserId,
        roomId
      }
    });
  }
}
