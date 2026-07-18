import { createTransport, type Transport } from '@betternotify/email/transports';
import { NotifyRpcProviderError } from '@betternotify/core';
import {
  createDirectus,
  rest,
  readItems,
  createItem,
  staticToken,
} from '@directus/sdk';

type DirectusTransportOptions = {
  url: string;
  token: string;
};

/**
 * Better Notify transport that delivers notifications through Directus.
 *
 * Instead of sending an email, this transport creates a notification item
 * in the Directus `notifications` collection for the matched user.
 *
 * The recipient (`message.to`) is resolved to a Directus user by email.
 * If no user is found, the transport throws a NotifyRpcProviderError.
 */
export const directusTransport = (options: DirectusTransportOptions): Transport => {
  const directus = createDirectus(options.url)
    .with(rest())
    .with(staticToken(options.token));

  const resolveRecipient = async (to: string | readonly (string | { email?: string })[]) => {
    const emails: string[] = [];
    const recipients = Array.isArray(to) ? to : [to];

    for (const recipient of recipients) {
      const email = typeof recipient === 'string' ? recipient : recipient?.email;
      if (email) emails.push(email);
    }

    if (emails.length === 0) {
      return { accepted: [] as string[], rejected: [] as string[], users: [] as any[] };
    }

    const users = await directus.request(
      readItems('directus_users', {
        filter: { email: { _in: emails } },
        fields: ['id', 'email', 'first_name', 'last_name'],
      }),
    );

    const userMap = new Map((users as any[]).map((u) => [u.email, u]));
    const accepted: string[] = [];
    const rejected: string[] = [];

    for (const email of emails) {
      if (userMap.has(email)) {
        accepted.push(email);
      } else {
        rejected.push(email);
      }
    }

    return { accepted, rejected, users: users as any[] };
  };

  return createTransport({
    name: 'directus',
    send: async (message, ctx) => {
      const { accepted, rejected, users } = await resolveRecipient(message.to);

      if (accepted.length === 0) {
        throw new NotifyRpcProviderError({
          message: `No Directus user found for recipients: ${rejected.join(', ')}`,
          provider: 'directus',
          retriable: false,
          route: ctx.route,
          messageId: ctx.messageId,
        });
      }

      const user = users.find((u) => u.email === accepted[0]);
      if (!user) {
        throw new NotifyRpcProviderError({
          message: `Directus user not found for: ${accepted[0]}`,
          provider: 'directus',
          retriable: false,
          route: ctx.route,
          messageId: ctx.messageId,
        });
      }

      const notification = await directus.request(
        createItem('notifications', {
          recipient: user.id,
          content: message.html || message.text,
          type: 'email',
          is_read: false,
          payload: {
            subject: message.subject,
            from: message.from,
            route: ctx.route,
            messageId: ctx.messageId,
            text: message.text,
          },
        }),
      );

      return {
        ok: true,
        data: {
          accepted,
          rejected,
          directusId: (notification as any).id,
        },
      };
    },
    verify: async () => {
      try {
        await directus.request(readItems('directus_users', { limit: 1 }));
        return { ok: true, details: { status: 'connected' } };
      } catch (error) {
        return { ok: false, details: { error: (error as Error).message } };
      }
    },
  });
};
