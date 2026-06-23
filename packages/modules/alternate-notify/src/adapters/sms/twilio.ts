import { NotificationChannelAdapter, ChannelSendResult } from '../../ports/channels.js';
import { NotificationPayload, UserChannelAddresses } from '../../domain/types.js';
import twilio from 'twilio';

export interface TwilioAdapterOptions {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export class TwilioSmsAdapter implements NotificationChannelAdapter {
  readonly type = 'sms' as const;
  private client;

  constructor(private readonly opts: TwilioAdapterOptions) {
    this.client = twilio(opts.accountSid, opts.authToken);
  }

  async send(
    payload: NotificationPayload,
    address: UserChannelAddresses
  ): Promise<ChannelSendResult> {
    const phone = address.addresses[0]?.address;
    if (!phone) {
      return {
        success: false,
        provider: 'twilio',
        error: new Error('No phone number')
      };
    }

    const { text } = payload.data as { text?: string };

    try {
      const res = await this.client.messages.create({
        to: phone,
        from: this.opts.fromNumber,
        body: text ?? 'Notification'
      });

      return {
        success: true,
        provider: 'twilio',
        externalId: res.sid
      };
    } catch (error) {
      return {
        success: false,
        provider: 'twilio',
        error: error as Error
      };
    }
  }
}
