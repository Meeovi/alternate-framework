import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicy, CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { NotFoundError, ForbiddenError } from '../errors';

export interface RemoveMemberInput {
  roomId: string;
  userId: string;
}

export interface RemoveMemberDeps {
  storage: CommunicationStorageAdapter;
  policy: CommunicationPolicy;
  eventBus: EventBus;
}

export async function removeMember(
  deps: RemoveMemberDeps,
  ctx: CommunicationPolicyContext,
  input: RemoveMemberInput
): Promise<void> {
  const room = await deps.storage.getRoomById(input.roomId);
  if (!room) throw new NotFoundError('Room not found');

  if (!deps.policy.canManageMembers(ctx, room)) {
    throw new ForbiddenError('Not allowed to manage members');
  }

  await deps.storage.removeMember(input.roomId, input.userId);

  await deps.eventBus.publish({
    type: 'room.updated',
    room
  });
}
