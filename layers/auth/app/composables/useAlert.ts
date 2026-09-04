// Auth-event notifications (login, password reset, 2FA, password changed).
//
// The actual send happens server-side at POST /api/notifications/auth —
// resolving the user's email and talking to the Directus notification
// transport with the static token, which is server-only and never reaches
// the browser. This composable is just the typed client for that endpoint.

interface AuthNotificationInput {
  userId: string;
  [key: string]: unknown;
}

type AuthNotificationRoute =
  | 'login'
  | 'passwordReset'
  | 'twoFactorCode'
  | 'passwordChanged';

export function useAlert() {
  const notify = async (
    input: AuthNotificationInput,
    route: AuthNotificationRoute,
  ): Promise<void> => {
    await $fetch('/api/notifications/auth', {
      method: 'POST',
      body: { userId: input.userId, route, input },
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
