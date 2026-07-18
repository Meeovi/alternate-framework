import { createNotify, createClient } from '@betternotify/core';
import { consoleLogger } from '@betternotify/core/logger';
import { emailChannel } from '@betternotify/email';
import { createTransport, multiTransport } from '@betternotify/email/transports';
import { z } from 'zod';
import { env, recipientEmail } from './notify';

const ch = emailChannel({
  defaults: { from: { name: process.env.SMTP_FROM_NAME, email: process.env.SMTP_USER } },
});
const rpc = createNotify({ channels: { email: ch } });
const catalog = rpc.catalog({
  welcome: rpc
    .email()
    .input(z.object({ name: z.string() }))
    .subject(({ input }) => `Welcome, ${input.name}!`)
    .template({
      render: async ({ input }) => ({
        text: `Welcome, ${input.name}!`,
        html: `<p>Welcome, ${input.name}!</p>`,
      }),
    }),
});

const slowOk = (name: string, delayMs: number) =>
  createTransport({
    name,
    send: async (message) => {
      await new Promise((r) => setTimeout(r, delayMs));
      return {
        ok: true,
        data: {
          accepted: message.to.map((a) => (typeof a === 'string' ? a : a.email)),
          rejected: [],
        },
      };
    },
  });

export const runMultiRace = async (): Promise<void> => {
  const composite = multiTransport({
    name: 'race',
    strategy: 'race',
    transports: [
      { transport: slowOk('slow-provider', 80) },
      { transport: slowOk('fast-provider', 20) },
      { transport: slowOk('medium-provider', 50) },
    ],
    logger: consoleLogger({ level: 'debug' }),
  });

  const mail = createClient({
    catalog,
    transportsByChannel: { email: composite },
    logger: consoleLogger({ level: 'debug' }),
  });

  const result = await mail.welcome.send({
    to: recipientEmail(),
    input: { name: 'John Doe' },
  });

  console.log('Message ID:', result.messageId);
  console.log('Send:      ', `${result.timing.sendMs.toFixed(1)}ms`);
  console.log('the fastest transport wins; the others are still in-flight when we return.');
};
