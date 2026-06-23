// packages/alternate-security/src/integration/events.ts
import { eventBus } from '@mframework/alternate-events';

export interface SomeSecurityService {
  trackLogin(userId: string, ip: string): Promise<void>;
}

export function wireSecurityEventHandlers(service: SomeSecurityService) {
  eventBus.subscribe('auth.user.login', async (event) => {
    const { userId, ip } = event.payload as any;
    await service.trackLogin(userId, ip);
  });
}
