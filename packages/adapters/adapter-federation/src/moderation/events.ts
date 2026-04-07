export type ModerationProtocol = 'activitypub' | 'atproto' | 'ostatus' | 'forgefed'

export type ModerationAction = 'flag' | 'mute' | 'block' | 'suspend' | 'report'

export type FederationModerationEvent = {
  protocol: ModerationProtocol
  action: ModerationAction
  actor: string
  target: string
  reason?: string
  timestamp: string
  evidence?: Record<string, unknown>
}

export function createModerationEvent(input: {
  protocol: ModerationProtocol
  action: ModerationAction
  actor: string
  target: string
  reason?: string
  evidence?: Record<string, unknown>
  timestamp?: string
}): FederationModerationEvent {
  return {
    protocol: input.protocol,
    action: input.action,
    actor: input.actor,
    target: input.target,
    reason: input.reason,
    evidence: input.evidence,
    timestamp: input.timestamp ?? new Date().toISOString(),
  }
}

export function toActivityPubFlag(event: FederationModerationEvent): Record<string, unknown> {
  return {
    type: 'Flag',
    actor: event.actor,
    object: event.target,
    content: event.reason ?? '',
    published: event.timestamp,
    evidence: event.evidence,
  }
}
