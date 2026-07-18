import { createNotify, createClient } from '@betternotify/core';
import { consoleLogger } from '@betternotify/core/logger';
import { emailChannel } from '@betternotify/email';
import { multiTransport } from '@betternotify/email/transports';
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

export const runMultiParallel = async (): Promise<void> => {
  const composite = multiTransport({
    name: 'parallel',
    strategy: 'parallel',
    transports: [
      { transport: mockTransport('primary') },
      { transport: mockTransport('audit-copy') },
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
  console.log('verified-redundancy: every branch must succeed; we throw if any one fails.');
};
