import { eventBus } from '@mframework/alternate-events';

export class AuthService {
  async login({ email, password, ip, userAgent }: {
    email: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }) {
    const user = await this.verifyCredentials(email, password);

    await eventBus.publish({
      type: 'auth.user.login',
      occurredAt: new Date(),
      payload: {
        userId: user.id,
        ip,
        userAgent
      }
    });

    return user;
  }

  async register(data: { email: string; password: string }) {
    const user = await this.createUser(data);

    await eventBus.publish({
      type: 'auth.user.registered',
      occurredAt: new Date(),
      payload: {
        userId: user.id,
        email: user.email
      }
    });

    return user;
  }
}
