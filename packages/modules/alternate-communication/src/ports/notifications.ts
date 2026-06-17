import { Message } from '../domain/entities/Message';
import { Room } from '../domain/entities/Room';

export interface NotifyNewMessageInput {
  message: Message;
  room: Room;
  recipients: string[];
}

export interface CommunicationNotificationAdapter {
  notifyNewMessage(input: NotifyNewMessageInput): Promise<void>;
}
