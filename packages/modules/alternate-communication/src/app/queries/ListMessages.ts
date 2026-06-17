import { Message } from '../../domain/entities/Message';
import {
  CommunicationStorageAdapter,
  ListMessagesOptions
} from '../../ports/storage';
import { CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { NotFoundError } from '../errors';

export interface ListMessagesInput extends ListMessagesOptions {
  roomId: string;
}

export interface ListMessagesDeps {
  storage: CommunicationStorageAdapter;
}

export async function listMessages(
  deps: ListMessagesDeps,
  ctx: CommunicationPolicyContext,
  input: ListMessagesInput
): Promise<Message[]> {
  const room = await deps.storage.getRoomById(input.roomId);
  if (!room) throw new NotFoundError('Room not found');

  // Membership/visibility checks can be added here if needed.
  return deps.storage.listMessages(input.roomId, input);
}
