export type SecurityEventType =
  | 'security.suspicious-activity'
  | 'security.rate-limit.hit'
  | 'security.access.denied'
  | 'security.access.granted'
  | 'auth.user.login'
  | 'auth.user.logout'
  | 'auth.user.registered'
  | 'communication.message.created'
  | 'communication.user.mentioned'
  | 'search.query.executed';

export interface SecurityEventBase {
  type: SecurityEventType;
  occurredAt: Date;
}

export interface SuspiciousActivityEvent extends SecurityEventBase {
  type: 'security.suspicious-activity';
  payload: {
    userId?: string;
    ip?: string;
    reason: string;
    context?: Record<string, unknown>;
  };
}

export interface RateLimitHitEvent extends SecurityEventBase {
  type: 'security.rate-limit.hit';
  payload: {
    key: string;
    limit: number;
    windowMs: number;
    ip?: string;
    userId?: string;
  };
}

export interface AccessDeniedEvent extends SecurityEventBase {
  type: 'security.access.denied';
  payload: {
    userId?: string;
    resource: string;
    action: string;
    reason: string;
  };
}

export interface AccessGrantedEvent extends SecurityEventBase {
  type: 'security.access.granted';
  payload: {
    userId?: string;
    resource: string;
    action: string;
  };
}

export interface AuthUserLoginEvent extends SecurityEventBase {
  type: 'auth.user.login';
  payload: {
    userId: string;
    ip?: string;
    userAgent?: string;
  };
}

export interface AuthUserLogoutEvent extends SecurityEventBase {
  type: 'auth.user.logout';
  payload: {
    userId: string;
  };
}

export interface AuthUserRegisteredEvent extends SecurityEventBase {
  type: 'auth.user.registered';
  payload: {
    userId: string;
    email?: string;
  };
}

export interface CommunicationMessageCreatedEvent extends SecurityEventBase {
  type: 'communication.message.created';
  payload: {
    messageId: string;
    senderId: string;
    recipientId?: string;
    roomId?: string;
    snippet?: string;
  };
}

export interface CommunicationUserMentionedEvent extends SecurityEventBase {
  type: 'communication.user.mentioned';
  payload: {
    messageId: string;
    mentionedUserId: string;
    roomId?: string;
  };
}

export interface SearchQueryExecutedEvent extends SecurityEventBase {
  type: 'search.query.executed';
  payload: {
    userId?: string;
    query: string;
    ip?: string;
  };
}

export type SecurityEvent =
  | SuspiciousActivityEvent
  | RateLimitHitEvent
  | AccessDeniedEvent
  | AccessGrantedEvent
  | AuthUserLoginEvent
  | AuthUserLogoutEvent
  | AuthUserRegisteredEvent
  | CommunicationMessageCreatedEvent
  | CommunicationUserMentionedEvent
  | SearchQueryExecutedEvent;
