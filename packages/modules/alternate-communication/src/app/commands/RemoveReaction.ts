import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { NotFoundError } from '../errors';

export interface RemoveReactionInput {
  messageId: string;
  emoji: string;
}

export interface RemoveReactionDeps {
  storage: CommunicationStorageAdapter;
  eventBus: EventBus;
}

export async function removeReaction(
  deps: RemoveReactionDeps,
  ctx: CommunicationPolicyContext,
  input: RemoveReactionInput
): Promise<void> {
  const message = await deps.storage.getMessageById(input.messageId);
  if (!message) throw new NotFoundError('Message not found');

  await deps.storage.removeReaction(input.messageId, ctx.userId, input.emoji);

  await deps.eventBus.publish({
    type: 'reaction.removed',
    reaction: {
      messageId: input.messageId,
      userId: ctx.userId,
      emoji: input.emoji,
      createdAt: new Date().toISOString()
    }
  });
}
