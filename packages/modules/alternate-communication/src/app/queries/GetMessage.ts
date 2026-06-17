import { CommunicationStorageAdapter } from '../../ports/storage';
import { CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';
import { NotFoundError } from '../errors';

export interface GetMessageDeps {
  storage: CommunicationStorageAdapter;
}

export async function getMessage(
  deps: GetMessageDeps,
  ctx: CommunicationPolicyContext,
  messageId: string
) {
  const message = await deps.storage.getMessageById(messageId);
  if (!message) throw new NotFoundError('Message not found');
  return message;
}
