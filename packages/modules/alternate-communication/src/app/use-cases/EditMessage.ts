import { Message } from '../../domain/entities/Message';
import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicy, CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { NotFoundError, ForbiddenError, ValidationError } from './errors';

export interface EditMessageInput {
  messageId: string;
  body: string;
}

export interface EditMessageDeps {
  storage: CommunicationStorageAdapter;
  policy: CommunicationPolicy;
  eventBus: EventBus;
}

export async function editMessage(
  deps: EditMessageDeps,
  ctx: CommunicationPolicyContext,
  input: EditMessageInput
): Promise<Message> {
  if (!input.body || input.body.trim().length === 0) {
    throw new ValidationError('Message body is required');
  }

  const existing = await deps.storage.getMessageById(input.messageId);
  if (!existing) {
    throw new NotFoundError('Message not found');
  }

  if (!deps.policy.canEditMessage(ctx, existing)) {
    throw new ForbiddenError('Not allowed to edit this message');
  }

  const updated = await deps.storage.updateMessage(input.messageId, {
    body: input.body,
    edited: true,
    updatedAt: new Date().toISOString()
  });

  await deps.eventBus.publish({ type: 'message.updated', message: updated });
  return updated;
}
