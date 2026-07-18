import { createNotify, createClient } from '@betternotify/core';
import { consoleLogger } from '@betternotify/core/logger';
import { emailChannel } from '@betternotify/email';
import { createTransport, multiTransport } from '@betternotify/email/transports';
import { z } from 'zod';
import { env, mockTransport, recipientEmail } from './notify';

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

const flakyMirror = createTransport({
  name: 'flaky-mirror',
  send: async () => {
    throw new Error('observability mirror unavailable — must not affect outcome');
  },
});

export const runMultiMirrored = async (): Promise<void> => {
  const composite = multiTransport({
    name: 'mirrored',
    strategy: 'mirrored',
    transports: [{ transport: mockTransport('primary') }, { transport: flakyMirror }],
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
  console.log('primary returned; mirror failure was logged at warn but did not affect the send.');
  await new Promise((r) => setTimeout(r, 50));
};
