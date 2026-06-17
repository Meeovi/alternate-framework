import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { NotFoundError } from '../errors';
import { RoomMember } from '../../domain/entities/RoomMember';

export interface ListMembersDeps {
  storage: CommunicationStorageAdapter;
}

export async function listMembers(
  deps: ListMembersDeps,
  ctx: CommunicationPolicyContext,
  roomId: string
): Promise<RoomMember[]> {
  const room = await deps.storage.getRoomById(roomId);
  if (!room) throw new NotFoundError('Room not found');

  return deps.storage.listMembers(roomId);
}
