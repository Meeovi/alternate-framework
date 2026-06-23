# alternate-security

Foundational security module for the alternate-* ecosystem:

- Shared **event bus** for all modules
- **Access control** with pluggable policies
- **Rate limiting** with storage abstraction
- **Audit logging**
- **IP reputation** and suspicious activity events

## Quick start

```ts
import { createProductionSecurityModule } from 'alternate-security';

const security = createProductionSecurityModule();

// access control
const decision = await security.accessControl.check(
  { id: 'user_1', type: 'user', roles: ['user'] },
  { resource: 'communication', action: 'message:create' }
);

// rate limiting
const rl = await security.rateLimiter.check('api:/messages', {
  ip: '1.2.3.4',
  userId: 'user_1'
});

// event bus
security.eventBus.subscribe('communication.message.created', async (event) => {
  // wire into alternate-notify, alternate-analytics, etc.
});
