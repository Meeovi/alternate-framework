import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicy, CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { NotFoundError, ForbiddenError } from '../errors';
import { RoomMember } from '../../domain/entities/RoomMember';

export interface AddMemberInput {
  roomId: string;
  userId: string;
  role?: RoomMember['role'];
}

export interface AddMemberDeps {
  storage: CommunicationStorageAdapter;
  policy: CommunicationPolicy;
  eventBus: EventBus;
}

export async function addMember(
  deps: AddMemberDeps,
  ctx: CommunicationPolicyContext,
  input: AddMemberInput
): Promise<RoomMember> {
  const room = await deps.storage.getRoomById(input.roomId);
  if (!room) throw new NotFoundError('Room not found');

  if (!deps.policy.canManageMembers(ctx, room)) {
    throw new ForbiddenError('Not allowed to manage members');
  }

  const member: RoomMember = {
    roomId: input.roomId,
    userId: input.userId,
    role: input.role ?? 'member',
    joinedAt: new Date().toISOString()
  };

  const created = await deps.storage.addMember(member);

  await deps.eventBus.publish({
    type: 'room.updated',
    room
  });

  return created;
}
