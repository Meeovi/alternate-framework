import { NotificationChannelAdapter, ChannelSendResult } from '../../ports/channels.js';
import { NotificationPayload, UserChannelAddresses } from '../../domain/types.js';
import fetch from 'node-fetch';

export interface FcmAdapterOptions {
  serverKey: string;
}

export class FcmPushAdapter implements NotificationChannelAdapter {
  readonly type = 'push' as const;

  constructor(private readonly opts: FcmAdapterOptions) {}

  async send(
    payload: NotificationPayload,
    address: UserChannelAddresses
  ): Promise<ChannelSendResult> {
    const token = address.addresses[0]?.address;
    if (!token) {
      return {
        success: false,
        provider: 'fcm',
        error: new Error('No push token')
      };
    }

    const { title, body } = payload.data as {
      title?: string;
      body?: string;
    };

    try {
      const res = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${this.opts.serverKey}`
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: title ?? 'Notification',
            body: body ?? ''
          },
          data: payload.data
        })
      });

      return {
        success: res.ok,
        provider: 'fcm'
      };
    } catch (error) {
      return {
        success: false,
        provider: 'fcm',
        error: error as Error
      };
    }
  }
}
