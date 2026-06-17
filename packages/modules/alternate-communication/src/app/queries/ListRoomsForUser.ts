import {
  CommunicationStorageAdapter,
  ListRoomsOptions,
  ListRoomsResult
} from '../../ports/storage';
import { CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';

export interface ListRoomsForUserInput extends ListRoomsOptions {}

export interface ListRoomsForUserDeps {
  storage: CommunicationStorageAdapter;
}

export async function listRoomsForUser(
  deps: ListRoomsForUserDeps,
  ctx: CommunicationPolicyContext,
  input: ListRoomsForUserInput
): Promise<ListRoomsResult> {
  return deps.storage.getRoomsForUser(ctx.userId, input);
}
