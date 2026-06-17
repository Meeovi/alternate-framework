import { CommunicationSearchAdapter, SearchMessagesQuery } from '../../src/ports/search';
import { Message } from '../../src/domain/entities/Message';

export interface AlternateSearchClient {
  index: (index: string, document: any) => Promise<void>;
  delete: (index: string, id: string) => Promise<void>;
  search: (index: string, query: any) => Promise<any[]>;
}

export interface AlternateSearchAdapterOptions {
  client: AlternateSearchClient;
  indexName?: string;
}

export function createAlternateSearchAdapter(
  options: AlternateSearchAdapterOptions
): CommunicationSearchAdapter {
  const index = options.indexName ?? 'communication_messages';

  return {
    async indexMessage(message: Message) {
      await options.client.index(index, {
        id: message.id,
        roomId: message.roomId,
        userId: message.userId,
        body: message.body,
        createdAt: message.createdAt
      });
    },

    async deleteMessage(messageId: string) {
      await options.client.delete(index, messageId);
    },

    async searchMessages(query: SearchMessagesQuery): Promise<Message[]> {
      const results = await options.client.search(index, {
        text: query.text,
        roomId: query.roomId,
        userId: query.userId,
        limit: query.limit ?? 50
      });

      return results as Message[];
    }
  };
}
