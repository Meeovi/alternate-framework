# @meeovi/adapter-rocketchat

Adapter for integrating Rocket.Chat with the `@meeovi/chat` layer.

Usage:

1. Register at runtime from your app startup:

```ts
import { registerRocketChat } from '@meeovi/adapter-rocketchat'

registerRocketChat({ baseUrl: 'https://chat.example.com', token: '...', userId: '...' })
```

2. The adapter exposes `createRocketChatProvider` so you can create and register
   multiple instances programmatically.
