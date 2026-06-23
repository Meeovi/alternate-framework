# @mframework/alternate-notify

Backend-agnostic, provider-pluggable notification module.

## Quick start

```ts
import { createProductionNotificationModule } from 'alternate-notify';

const { dispatcher, preferences, addresses } = createProductionNotificationModule();

// set addresses
await addresses.setUserAddresses({
  userId: 'user_1',
  addresses: [
    { channel: 'email', address: 'user@example.com' },
    { channel: 'push', address: 'fcm-token-123' }
  ]
});

// dispatch notification
await dispatcher.dispatch({
  userId: 'user_1',
  templateKey: 'communication.new-message',
  data: {
    senderName: 'Alice',
    snippet: 'Hey, are you free later?'
  },
  channels: ['email', 'push']
});

Wire it to alternate-communication by mapping chat events into dispatcher.dispatch() calls.