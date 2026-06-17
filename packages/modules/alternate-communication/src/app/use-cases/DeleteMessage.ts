import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicy, CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { NotFoundError, ForbiddenError } from './errors';

export interface DeleteMessageInput {
  messageId: string;
  hard?: boolean;
}

export interface DeleteMessageDeps {
  storage: CommunicationStorageAdapter;
  policy: CommunicationPolicy;
  eventBus: EventBus;
}

export async function deleteMessage(
  deps: DeleteMessageDeps,
  ctx: CommunicationPolicyContext,
  input: DeleteMessageInput
): Promise<void> {
  const existing = await deps.storage.getMessageById(input.messageId);
  if (!existing) {
    throw new NotFoundError('Message not found');
  }

  if (!deps.policy.canDeleteMessage(ctx, existing)) {
    throw new ForbiddenError('Not allowed to delete this message');
  }

  if (input.hard) {
    await deps.storage.hardDeleteMessage(input.messageId);
  } else {
    await deps.storage.softDeleteMessage(input.messageId, ctx.userId);
  }

  await deps.eventBus.publish({
    type: 'message.deleted',
    messageId: input.messageId,
    roomId: existing.roomId
  });
}
