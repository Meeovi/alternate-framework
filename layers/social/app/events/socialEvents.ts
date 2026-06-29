// layers/social/events/socialEvents.ts

type SocialEventName =
  | 'post:created'
  | 'post:updated'
  | 'post:deleted'
  | 'comment:created'
  | 'comment:deleted'
  | 'live:started'
  | 'live:stopped'
  | 'user:followed'
  | 'user:unfollowed'
  | 'user:added_to_circle'
  | 'user:removed_from_circle'
  | 'user:blocked'
  | 'user:unblocked'
  | 'notification:created'
  | 'user:muted'
  | 'user:blocked'
  | 'post:muted'
  | 'post:blocked'

type SocialEventHandler = (payload: any) => void

const listeners = new Map<SocialEventName, Set<SocialEventHandler>>()

export const onSocialEvent = (event: SocialEventName, handler: SocialEventHandler) => {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(handler)
  return () => listeners.get(event)!.delete(handler)
}

export const emitSocialEvent = (event: SocialEventName, payload: any) => {
  const handlers = listeners.get(event)
  if (!handlers) return
  for (const handler of handlers) handler(payload)
}

export const removeAllListeners = () => {
  listeners.clear()
}

export const removeListenersForEvent = (event: SocialEventName) => {
  listeners.delete(event)
}