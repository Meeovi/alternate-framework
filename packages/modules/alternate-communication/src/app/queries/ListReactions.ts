import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { NotFoundError } from '../errors';
import { Reaction } from '../../domain/entities/Reaction';

export interface ListReactionsDeps {
  storage: CommunicationStorageAdapter;
}

export async function listReactions(
  deps: ListReactionsDeps,
  ctx: CommunicationPolicyContext,
  messageId: string
): Promise<Reaction[]> {
  const message = await deps.storage.getMessageById(messageId);
  if (!message) throw new NotFoundError('Message not found');

  return deps.storage.listReactions(messageId);
}
