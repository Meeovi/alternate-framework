import { Message } from '../../domain/entities/Message';
import { CommunicationStorageAdapter } from '../../ports/storage';
import {
  CommunicationPolicy,
  CommunicationPolicyContext
} from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { NotFoundError, ForbiddenError, ValidationError } from '../errors';

export interface SendMessageInput {
  roomId: string;
  body: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageDeps {
  storage: CommunicationStorageAdapter;
  policy: CommunicationPolicy;
  eventBus: EventBus;
}

export async function sendMessage(
  deps: SendMessageDeps,
  ctx: CommunicationPolicyContext,
  input: SendMessageInput
): Promise<Message> {
  if (!input.body || input.body.trim().length === 0) {
    throw new ValidationError('Message body is required');
  }

  const room = await deps.storage.getRoomById(input.roomId);
  if (!room) throw new NotFoundError('Room not found');

  if (!deps.policy.canSendMessage(ctx, room)) {
    throw new ForbiddenError('Not allowed to send message in this room');
  }

  const now = new Date().toISOString();

  const message: Message = {
    id: crypto.randomUUID(),
    roomId: input.roomId,
    userId: ctx.userId,
    type: 'default',
    body: input.body,
    parentId: input.parentId,
    createdAt: now,
    updatedAt: now,
    edited: false,
    metadata: input.metadata
  };

  const created = await deps.storage.createMessage(message);

  await deps.eventBus.publish({
    type: 'message.created',
    message: created
  });

  return created;
}
