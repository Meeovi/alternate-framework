import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicy, CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { NotFoundError, ForbiddenError } from '../errors';

export interface UnmuteMemberInput {
  roomId: string;
  userId: string;
}

export interface UnmuteMemberDeps {
  storage: CommunicationStorageAdapter;
  policy: CommunicationPolicy;
  eventBus: EventBus;
}

export async function unmuteMember(
  deps: UnmuteMemberDeps,
  ctx: CommunicationPolicyContext,
  input: UnmuteMemberInput
) {
  const room = await deps.storage.getRoomById(input.roomId);
  if (!room) throw new NotFoundError('Room not found');

  if (!deps.policy.canManageMembers(ctx, room)) {
    throw new ForbiddenError('Not allowed to unmute members');
  }

  const updated = await deps.storage.updateMember(input.roomId, input.userId, {
    mutedUntil: null
  });

  await deps.eventBus.publish({
    type: 'room.updated',
    room
  });

  return updated;
}
