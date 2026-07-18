import { createNotify, createClient, consoleLogger } from '@betternotify/core';
import { emailChannel } from '@betternotify/email';
import { config } from '@vue-email/compiler';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mockTransport, makeWelcomeInput, recipientEmail } from './notify';

const __dirname = dirname(fileURLToPath(import.meta.url));
const emailRenderer = config(join(__dirname, 'emails'));

const ch = emailChannel({
  defaults: { from: { name: process.env.SMTP_FROM_NAME, email: process.env.SMTP_USER } },
});

const rpc = createNotify({ channels: { email: ch } });
const catalog = rpc.catalog({
  welcome: rpc
    .email()
    .input(z.object({ name: z.string(), verifyUrl: z.string().url() }))
    .subject(({ input }) => `Welcome, ${input.name}!`)
    .template({
      render: async ({ input }) => {
        const result = await emailRenderer.render('Welcome', {
          props: { name: input.name, verifyUrl: input.verifyUrl },
        });
        return { html: result.html, text: result.text };
      },
    }),
});

export const runVueEmail = async (): Promise<void> => {
  const mail = createClient({
    catalog,
    transportsByChannel: { email: mockTransport('mock') },
    logger: consoleLogger({ level: 'info' }),
  });

  const result = await mail.welcome.send({
    to: recipientEmail(),
    input: makeWelcomeInput('John Doe'),
  });

  console.log('messageId:', result.messageId);
  console.log('— rendered with Vue Email compiler + @betternotify/email template adapter.');
};
