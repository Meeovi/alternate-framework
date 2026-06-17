import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicy, CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { NotFoundError, ForbiddenError } from '../errors';

export interface MuteMemberInput {
  roomId: string;
  userId: string;
  until: string; // ISO timestamp
}

export interface MuteMemberDeps {
  storage: CommunicationStorageAdapter;
  policy: CommunicationPolicy;
  eventBus: EventBus;
}

export async function muteMember(
  deps: MuteMemberDeps,
  ctx: CommunicationPolicyContext,
  input: MuteMemberInput
) {
  const room = await deps.storage.getRoomById(input.roomId);
  if (!room) throw new NotFoundError('Room not found');

  if (!deps.policy.canManageMembers(ctx, room)) {
    throw new ForbiddenError('Not allowed to mute members');
  }

  const updated = await deps.storage.updateMember(input.roomId, input.userId, {
    mutedUntil: input.until
  });

  await deps.eventBus.publish({
    type: 'room.updated',
    room
  });

  return updated;
}
