import { Room, RoomType } from '../../domain/entities/Room';
import { CommunicationStorageAdapter } from '../../ports/storage';
import {
  CommunicationPolicy,
  CommunicationPolicyContext
} from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { ForbiddenError } from '../errors';

export interface CreateRoomInput {
  type: RoomType;
  title?: string;
  slug?: string;
  isPrivate?: boolean;
  isReadOnly?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CreateRoomDeps {
  storage: CommunicationStorageAdapter;
  policy: CommunicationPolicy;
  eventBus: EventBus;
}

export async function createRoom(
  deps: CreateRoomDeps,
  ctx: CommunicationPolicyContext,
  input: CreateRoomInput
): Promise<Room> {
  if (!deps.policy.canCreateRoom(ctx, { type: input.type })) {
    throw new ForbiddenError('Not allowed to create room');
  }

  const now = new Date().toISOString();

  const room: Room = {
    id: crypto.randomUUID(),
    type: input.type,
    title: input.title,
    slug: input.slug,
    createdAt: now,
    updatedAt: now,
    createdBy: ctx.userId,
    isPrivate: input.isPrivate ?? false,
    isReadOnly: input.isReadOnly ?? false,
    metadata: input.metadata
  };

  const created = await deps.storage.createRoom(room);

  await deps.eventBus.publish({
    type: 'room.created',
    room: created
  });

  return created;
}
