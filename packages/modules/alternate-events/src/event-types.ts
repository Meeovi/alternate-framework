// EVENT TYPE REGISTRY
export type AlternateEventType =
  | 'auth.user.login'
  | 'auth.user.logout'
  | 'auth.user.registered'
  | 'communication.message.created'
  | 'communication.user.mentioned'
  | 'notify.notification.sent'
  | 'notify.notification.failed'
  | 'search.query.executed'
  | 'security.access.granted'
  | 'security.access.denied'
  | 'security.rate-limit.hit'
  | 'security.suspicious-activity';

// BASE EVENT SHAPE
export interface AlternateEventBase<T extends AlternateEventType = AlternateEventType> {
  type: T;
  occurredAt: Date;
  payload: Record<string, unknown>;
}

// FULL EVENT UNION
export type AlternateEvent =
  | AlternateEventBase<'auth.user.login'>
  | AlternateEventBase<'auth.user.logout'>
  | AlternateEventBase<'auth.user.registered'>
  | AlternateEventBase<'communication.message.created'>
  | AlternateEventBase<'communication.user.mentioned'>
  | AlternateEventBase<'notify.notification.sent'>
  | AlternateEventBase<'notify.notification.failed'>
  | AlternateEventBase<'search.query.executed'>
  | AlternateEventBase<'security.access.granted'>
  | AlternateEventBase<'security.access.denied'>
  | AlternateEventBase<'security.rate-limit.hit'>
  | AlternateEventBase<'security.suspicious-activity'>;
