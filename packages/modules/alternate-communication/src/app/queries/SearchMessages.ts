import { CommunicationSearchAdapter } from '../../ports/search';
import { CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { Message } from '../../domain/entities/Message';

export interface SearchMessagesDeps {
  search: CommunicationSearchAdapter;
}

export interface SearchMessagesInput {
  text: string;
  roomId?: string;
  limit?: number;
}

export async function searchMessages(
  deps: SearchMessagesDeps,
  ctx: CommunicationPolicyContext,
  input: SearchMessagesInput
): Promise<Message[]> {
  return deps.search.searchMessages({
    text: input.text,
    roomId: input.roomId,
    limit: input.limit ?? 50
  });
}
