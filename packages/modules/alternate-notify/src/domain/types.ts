export type UserId = string;
export type ChannelId = string;
export type NotificationId = string;

export type NotificationChannelType =
  | 'email'
  | 'sms'
  | 'push'
  | 'webhook'
  | 'in_app';

export interface NotificationPayload {
  id: NotificationId;
  userId: UserId;
  channel: NotificationChannelType;
  templateKey: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ChannelAddress {
  channel: NotificationChannelType;
  address: string;
}

export interface UserChannelAddresses {
  userId: UserId;
  addresses: ChannelAddress[];
}
