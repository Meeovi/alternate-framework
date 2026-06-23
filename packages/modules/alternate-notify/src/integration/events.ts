import { eventBus } from '@mframework/alternate-events';
import type { NotificationDispatcher } from '../core/dispatcher.js';

export function wireNotificationEvents(dispatcher: NotificationDispatcher) {
  // New message → notify recipient
  eventBus.subscribe('communication.message.created', async (event) => {
    const { messageId, senderId, roomId, snippet } = event.payload as any;

    await dispatcher.dispatch({
      userId: roomId, // or resolve recipients from room
      templateKey: 'communication.new-message',
      data: { messageId, senderId, snippet },
      channels: ['email', 'push']
    });
  });

  // Mention → notify mentioned user
  eventBus.subscribe('communication.user.mentioned', async (event) => {
    const { messageId, mentionedUserId, roomId } = event.payload as any;

    await dispatcher.dispatch({
      userId: mentionedUserId,
      templateKey: 'communication.mention',
      data: { messageId, roomId },
      channels: ['push']
    });
  });

  // Suspicious activity → notify admins (example)
  eventBus.subscribe('security.suspicious-activity', async (event) => {
    const { ip, userId, reason } = event.payload as any;

    await dispatcher.dispatch({
      userId: 'admin', // or admin group
      templateKey: 'security.alert',
      data: { ip, userId, reason },
      channels: ['email']
    });
  });
}
