import { Reaction } from '../../domain/entities/Reaction';
import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { NotFoundError, ValidationError } from './errors';

export interface AddReactionInput {
  messageId: string;
  emoji: string;
}

export interface AddReactionDeps {
  storage: CommunicationStorageAdapter;
  eventBus: EventBus;
}

export async function addReaction(
  deps: AddReactionDeps,
  ctx: CommunicationPolicyContext,
  input: AddReactionInput
): Promise<Reaction> {
  if (!input.emoji) {
    throw new ValidationError('Emoji is required');
  }

  const message = await deps.storage.getMessageById(input.messageId);
  if (!message) {
    throw new NotFoundError('Message not found');
  }

  const reaction: Reaction = {
    messageId: input.messageId,
    userId: ctx.userId,
    emoji: input.emoji,
    createdAt: new Date().toISOString()
  };

  const created = await deps.storage.addReaction(reaction);
  await deps.eventBus.publish({ type: 'reaction.added', reaction: created });
  return created;
}
