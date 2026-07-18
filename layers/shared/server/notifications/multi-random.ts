import { consoleLogger } from '@betternotify/core/logger';
import { createTransport, multiTransport } from '@betternotify/email/transports';
import { env, buildClient, makeWelcomeInput, recipientEmail } from './notify';

// Each transport closes over its own account-bound sender.
const stub = (label: string, accountFrom: string) =>
  createTransport({
    name: label,
    send: async (msg) => {
      const from = msg.from ?? accountFrom;
      console.log(`[${label}] from=${JSON.stringify(from)} to=${msg.to.join(',')}`);
      return { ok: true, data: { accepted: msg.to.map(String), rejected: [] } };
    },
  });

export const runMultiRandom = async (): Promise<void> => {
  const mail = buildClient({
    transportsByChannel: {
      email: multiTransport({
        name: 'random',
        strategy: 'random',
        transports: [
          { transport: stub('transport-1', 'a@example.com') },
          { transport: stub('transport-2', 'b@example.com') },
          { transport: stub('transport-3', 'c@example.com') },
        ],
        logger: consoleLogger({ level: 'info' }),
      }),
    },
  });

  const result = await mail.welcome.send({
    to: recipientEmail(),
    input: makeWelcomeInput('John Doe'),
  });

  console.log('---');
  console.log('Message ID:', result.messageId);
  console.log('Send:      ', `${result.timing.sendMs.toFixed(1)}ms`);
  console.log('(actual sender printed by selected provider above)');
};
