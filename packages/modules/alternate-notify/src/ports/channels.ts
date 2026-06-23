import { NotificationPayload, UserChannelAddresses } from '../domain/types.js';

export interface ChannelSendResult {
  success: boolean;
  provider: string;
  externalId?: string;
  error?: Error;
}

export interface NotificationChannelAdapter {
  readonly type: NotificationPayload['channel'];
  send(
    payload: NotificationPayload,
    address: UserChannelAddresses
  ): Promise<ChannelSendResult>;
}
