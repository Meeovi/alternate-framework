import { consoleLogger } from '@betternotify/core/logger';
import { resendTransport } from '@betternotify/resend';
import { buildClient, env, makeWelcomeInput, recipientEmail } from './notify';

export const runResend = async (): Promise<void> => {
  const mail = buildClient({
    transportsByChannel: {
      email: resendTransport({
        apiKey: env.RESEND_API_KEY ?? '',
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
