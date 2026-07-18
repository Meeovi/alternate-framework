import { createNotify, createClient } from '@betternotify/core';
import { withDryRun } from '@betternotify/core/middlewares';
import { emailChannel } from '@betternotify/email';
import { z } from 'zod';
import { env, mockTransport } from './notify';

export const runDryRun = async (): Promise<void> => {
  const email = z.string().email();
  const name = z.string();
  const emailValue = email.parse('test@example.com');
  const nameValue = name.parse('Test User');

  const ch = emailChannel({ defaults: { from: `${env.NUXT_PUBLIC_SITE_EMAIL}` } });
  const rpc = createNotify({ channels: { email: ch } }).use(withDryRun());
  const catalog = rpc.catalog({
    welcome: rpc
      .email()
      .input(z.object({ name: z.string() }))
      .subject(({ input }) => `Welcome, ${input.name}!`)
      .template({
        render: async ({ input }) => ({ html: `<p>Hello ${input.name}</p>` }),
      }),
  });

  const mail = createClient({
    catalog,
    transportsByChannel: { email: mockTransport('mock') },
  });

  const result = await mail.welcome.send({
    to: emailValue,
    input: { name: nameValue },
  });

  console.log('messageId:', result.messageId);
  console.log('— withDryRun short-circuited; render and transport never ran.');
};
