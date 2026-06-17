import { Presence, PresenceStatus } from '../../domain/entities/Presence';
import { EventBus } from '../../events/bus';
import { CommunicationPolicyContext } from '../../domain/policy/CommunicationPolicy';

export interface UpdatePresenceInput {
  status: PresenceStatus;
}

export interface UpdatePresenceDeps {
  eventBus: EventBus;
}

export async function updatePresence(
  deps: UpdatePresenceDeps,
  ctx: CommunicationPolicyContext,
  input: UpdatePresenceInput
): Promise<Presence> {
  const presence: Presence = {
    userId: ctx.userId,
    status: input.status,
    lastSeenAt: new Date().toISOString()
  };

  await deps.eventBus.publish({ type: 'presence.updated', presence });
  return presence;
}
