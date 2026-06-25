import { eventBus } from '@mframework/alternate-events';

export class SearchService {
  async search({ query, userId, ip }: {
    query: string;
    userId?: string;
    ip?: string;
  }) {
    const results = await this.engine.search(query);

    await eventBus.publish({
      type: 'search.query.executed',
      occurredAt: new Date(),
      payload: { query, userId, ip }
    });

    return results;
  }
}
