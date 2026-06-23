export type NotifyEventType =
  | 'notification.requested'
  | 'notification.sent'
  | 'notification.failed';

export interface NotifyEventBase {
  type: NotifyEventType;
  occurredAt: Date;
}

export interface NotificationRequestedEvent extends NotifyEventBase {
  type: 'notification.requested';
  payload: {
    userId: string;
    templateKey: string;
    channels?: ('email' | 'sms' | 'push' | 'webhook' | 'in_app')[];
    data: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
}

export interface NotificationSentEvent extends NotifyEventBase {
  type: 'notification.sent';
  payload: {
    notificationId: string;
    channel: string;
    provider: string;
  };
}

export interface NotificationFailedEvent extends NotifyEventBase {
  type: 'notification.failed';
  payload: {
    notificationId?: string;
    channel: string;
    provider: string;
    error: string;
  };
}

export type NotifyEvent =
  | NotificationRequestedEvent
  | NotificationSentEvent
  | NotificationFailedEvent;
