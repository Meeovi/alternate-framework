import sgMail from '@sendgrid/mail';
import {
  NotificationChannelAdapter,
  ChannelSendResult
} from '../../ports/channels.js';
import { NotificationPayload, UserChannelAddresses } from '../../domain/types.js';

export interface SendgridAdapterOptions {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export class SendgridEmailAdapter implements NotificationChannelAdapter {
  readonly type = 'email' as const;

  constructor(private readonly opts: SendgridAdapterOptions) {
    sgMail.setApiKey(opts.apiKey);
  }

  async send(
    payload: NotificationPayload,
    address: UserChannelAddresses
  ): Promise<ChannelSendResult> {
    const email = address.addresses[0]?.address;
    if (!email) {
      return {
        success: false,
        provider: 'sendgrid',
        error: new Error('No email address')
      };
    }

    const { html, text, subject } = payload.data as {
      html?: string;
      text?: string;
      subject?: string;
    };

    try {
      const [res] = await sgMail.send({
        to: email,
        from: {
          email: this.opts.fromEmail,
          name: this.opts.fromName
        },
        subject: subject ?? 'Notification',
        text: text ?? '',
        html
      });

      return {
        success: res.statusCode >= 200 && res.statusCode < 300,
        provider: 'sendgrid',
        externalId: res.headers['x-message-id'] as string | undefined
      };
    } catch (error) {
      return {
        success: false,
        provider: 'sendgrid',
        error: error as Error
      };
    }
  }
}
