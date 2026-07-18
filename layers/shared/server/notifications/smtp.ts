import { consoleLogger } from '@betternotify/core/logger';
import { smtpTransport } from '@betternotify/smtp';
import { buildClient, env, makeWelcomeInput, recipientEmail } from './notify';

export const runSmtp = async (): Promise<void> => {
  const mail = buildClient({
    transportsByChannel: {
      email: smtpTransport({
        host: env.SMTP_HOST ?? '',
        port: env.SMTP_PORT ?? 587,
        auth: { user: env.SMTP_USER ?? '', pass: env.SMTP_PASSWORD ?? '' },
      }),
    },
    logger: consoleLogger({ level: 'debug' }),
  });

  const result = await mail.welcome.send({
    to: recipientEmail(),
    input: makeWelcomeInput('John Doe'),
  });

  console.log('Message ID:', result.messageId);
  console.log('From:      ', result.envelope?.from);
  console.log('To:        ', result.envelope?.to.join(', '));
  console.log('Render:    ', `${result.timing.renderMs.toFixed(1)}ms`);
  console.log('Send:      ', `${result.timing.sendMs.toFixed(1)}ms`);
};
