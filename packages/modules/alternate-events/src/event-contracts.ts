import { AlternateEventBase } from './event-types';

// AUTH
export interface AuthUserLoginEvent extends AlternateEventBase {
  type: 'auth.user.login';
  payload: {
    userId: string;
    ip?: string;
    userAgent?: string;
  };
}

export interface AuthUserRegisteredEvent extends AlternateEventBase {
  type: 'auth.user.registered';
  payload: {
    userId: string;
    email?: string;
  };
}

// COMMUNICATION
export interface CommunicationMessageCreatedEvent extends AlternateEventBase {
  type: 'communication.message.created';
  payload: {
    messageId: string;
    senderId: string;
    roomId?: string;
    snippet?: string;
  };
}

export interface CommunicationUserMentionedEvent extends AlternateEventBase {
  type: 'communication.user.mentioned';
  payload: {
    messageId: string;
    mentionedUserId: string;
    roomId?: string;
  };
}

// NOTIFY
export interface NotifySentEvent extends AlternateEventBase {
  type: 'notify.notification.sent';
  payload: {
    notificationId: string;
    channel: string;
  };
}

export interface NotifyFailedEvent extends AlternateEventBase {
  type: 'notify.notification.failed';
  payload: {
    notificationId?: string;
    channel: string;
    error: string;
  };
}

// SECURITY
export interface SecuritySuspiciousActivityEvent extends AlternateEventBase {
  type: 'security.suspicious-activity';
  payload: {
    ip?: string;
    userId?: string;
    reason: string;
  };
}