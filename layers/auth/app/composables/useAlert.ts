// Better Notify integration for auth layer alerts.
// All notifications are tied to the logged-in user via the Directus transport.
import { createClient } from '@betternotify/core';
import { directusTransport } from '#shared/server/notifications/transports/directus';
import { notificationService } from '#shared/server/notifications/notify';
import { readItems } from '@directus/sdk';

/* ------------------------------------------------------------------ *
 * Auth notification composable
 *
 * Provides typed senders for auth events (login, password reset,
 * 2FA, password change) using Better Notify's `createClient` with
 * the Directus transport so every notification is stored in Directus
 * and tied to the logged-in user.
 * ------------------------------------------------------------------ */

interface AuthNotificationInput {
  userId: string;
  [key: string]: unknown;
}

export function useAlert() {
  const { $directus } = useNuxtApp() as any;
  const runtimeConfig = useRuntimeConfig();

  /**
   * Resolve the current user's email from the Directus user record
   * fetched via the SDK. Falls back to an empty string.
   */
  const getUserEmail = async (userId: string): Promise<string> => {
    try {
      const users = await $directus.request(
        (readItems as any)('directus_users', {
          filter: { id: { _eq: userId } },
          fields: ['email'],
          limit: 1,
        }),
      );
      const userList = users as Array<{ email: string }>;
      return userList[0]?.email ?? '';
    } catch {
      return '';
    }
  };

  /**
   * Sends an auth notification through the Directus transport,
   * tying it to the logged-in user by resolving their email.
   */
  const notify = async (
    input: AuthNotificationInput,
    route: string,
  ): Promise<void> => {
    const email = await getUserEmail(input.userId);
    if (!email) return;

    const directus = directusTransport({
      url: (runtimeConfig.public as any).directus.url as string,
      token: (runtimeConfig.public as any).directus.auth.token as string,
    });

    const client = createClient({
      catalog: notificationService,
      transportsByChannel: { email: directus },
    });

    await (client.auth as any)[route].send({
      to: email,
      input,
    });
  };

  return {
    /** Notification for a new login to the user's account. */
    login: (input: {
      userId: string;
      ipAddress?: string;
      device?: string;
      location?: string;
    }) => notify(input, 'login'),

    /** Notification for a password reset request. */
    passwordReset: (input: {
      userId: string;
      name: string;
      resetUrl: string;
    }) => notify(input, 'passwordReset'),

    /** Notification containing a 2FA verification code. */
    twoFactorCode: (input: {
      userId: string;
      code: string;
      validUntil: string;
    }) => notify(input, 'twoFactorCode'),

    /** Notification confirming a password change. */
    passwordChanged: (input: {
      userId: string;
    }) => notify(input, 'passwordChanged'),
  };
}
