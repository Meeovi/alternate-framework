import { consoleLogger } from '@betternotify/core/logger';
import { buildClient, makeWelcomeInput, recipientEmail } from './notify';

export const runSingle = async (): Promise<void> => {
  const mail = buildClient({
    logger: consoleLogger({ level: 'debug' }),
  });

  const result = await mail.welcome.send({
    to: recipientEmail(),
    input: makeWelcomeInput('John Doe'),
  });

  const data = result.data as { accepted: string[] };
  console.log('Message ID:', result.messageId);
  console.log('Accepted:  ', data.accepted.join(', '));
  console.log('Send:      ', `${result.timing.sendMs.toFixed(1)}ms`);
};
