import { Message } from '../domain/entities/Message';

export interface SearchMessagesQuery {
  text: string;
  roomId?: string;
  userId?: string;
  limit?: number;
}

export interface CommunicationSearchAdapter {
  indexMessage(message: Message): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  searchMessages(query: SearchMessagesQuery): Promise<Message[]>;
}
