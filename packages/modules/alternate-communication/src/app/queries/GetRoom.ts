import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { NotFoundError } from '../errors';

export interface GetRoomDeps {
  storage: CommunicationStorageAdapter;
}

export async function getRoom(
  deps: GetRoomDeps,
  ctx: CommunicationPolicyContext,
  roomId: string
) {
  const room = await deps.storage.getRoomById(roomId);
  if (!room) throw new NotFoundError('Room not found');
  return room;
}
