import { consoleLogger } from '@betternotify/core/logger';
import { createTransport, multiTransport } from '@betternotify/email/transports';
import { smtpTransport } from '@betternotify/smtp';
import { env, buildClient, mockFailSend, makeWelcomeInput } from './notify';

export const runMultiFailover = async (): Promise<void> => {
  const composite = multiTransport({
    name: 'failover',
    strategy: 'failover',
    transports: [
      {
        transport: createTransport({
          name: 'broken-primary',
          send: mockFailSend(new Error('simulated primary outage')),
        }),
      },
      {
        // smtp falls back to auth.user when message.from is unset
        transport: smtpTransport({
          host: env.SMTP_HOST || '',
          port: env.SMTP_PORT || 587,
          auth: { user: env.SMTP_USER || '', pass: env.SMTP_PASSWORD || '' },
        }),
      },
    ],
    logger: consoleLogger({ level: 'debug' }),
  });

  const mail = buildClient({
    transportsByChannel: { email: composite },
    logger: consoleLogger({ level: 'debug' }),
  });

  const result = await mail.welcome.send({
    to: env.SMTP_DESTINATION_EMAIL || '',
    input: makeWelcomeInput('John Doe'),
  });

  console.log('Message ID:', result.messageId);
  console.log('Send:      ', `${result.timing.sendMs.toFixed(1)}ms`);
};
