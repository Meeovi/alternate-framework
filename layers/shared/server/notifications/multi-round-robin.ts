import { consoleLogger } from '@betternotify/core/logger';
import { createTransport, multiTransport } from '@betternotify/email/transports';
import { env, buildClient, makeWelcomeInput, recipientEmail } from './notify';

// Each provider closes over its own verified sender — no framework defaultFrom.
const stubProvider = (label: string, accountFrom: { name: string; email: string }) =>
  createTransport({
    name: label,
    send: async (msg) => {
      const from = msg.from ?? accountFrom;
      console.log(`[${label}] from=${JSON.stringify(from)} to=${msg.to.join(',')}`);
      return { ok: true, data: { accepted: msg.to.map(String), rejected: [] } };
    },
  });

export const runMultiRoundRobin = async (): Promise<void> => {
  const composite = multiTransport({
    name: 'round-robin',
    strategy: 'round-robin',
    transports: [
      {
        transport: stubProvider('mock-a', { name: 'Account A', email: 'noreply@a.example.com' }),
      },
      {
        transport: stubProvider('mock-b', { name: 'Account B', email: 'noreply@b.example.com' }),
      },
    ],
    logger: consoleLogger({ level: 'debug' }),
  });

  const mail = buildClient({
    transportsByChannel: { email: composite },
    logger: consoleLogger({ level: 'info' }),
  });

  console.log('Two providers alternating round-robin; each stamps its account-bound `from`.');
  console.log('---');
  for (let i = 1; i <= 4; i++) {
    const result = await mail.welcome.send({
      to: recipientEmail(),
      input: makeWelcomeInput(`User ${i}`),
    });
    console.log(
      `Send #${i}: id=${result.messageId.slice(0, 8)} (see [provider] log above for from)`,
    );
  }
};
