import { os } from '@orpc/server';
import { z } from 'zod';
import { createClient } from '@betternotify/core';
import { notificationService as catalog, mockTransport } from './notify';

const mail = createClient({
  catalog,
  transportsByChannel: { email: mockTransport('mock') },
});

const injectNotify = os.middleware(async ({ next }) => {
  return next({ context: { mail } });
});

const base = os.use(injectNotify);

export const sendWelcome = base
  .input(
    z.object({
      to: z.email(),
      name: z.string(),
      verifyUrl: z.url(),
    }),
  )
  .handler(async ({ input, context }) => {
    const result = await context.mail.transactional.welcome.send({
      to: input.to,
      input: { name: input.name, verifyUrl: input.verifyUrl },
    });
    return { messageId: result.messageId };
  });

export const router = {
  notification: {
    sendWelcome,
  },
};
