# @mframework/meeovi-discussions

Live discussions instead of comments. Every content object (post, product,
outlet, vibe, station, story, …) gets its own Rocket.Chat room on
collaborrate.com. The room is embedded in Rocket.Chat's **embedded layout**,
which shows only the conversation, and the visitor is signed in with their
Meeovi session (SSO).

```vue
<MeeoviDiscussion type="product" :id="product.id" :title="product.name" />

<!-- feeds / cards: show a "Join the live discussion" bar, load the room on click -->
<MeeoviDiscussion type="post" :id="post.id" collapsed />
```

- Rooms are public channels named `discussion-<type>-<id>`. A room is created
  the first time a signed-in user opens it, titled with `title`.
- Guests see a "Sign in to join the live discussion" card with the message
  count. Rocket.Chat doesn't allow anonymous reading.
- Signed-in users get a Rocket.Chat account `meeovi-<user id>`, created on
  first use. Accounts are matched by that username only, never by email, so a
  Meeovi login can't take over an existing collaborrate.com account. The
  user's email is used only if it's verified on Meeovi.
- The embed is logged in by posting
  `{ externalCommand: 'login-with-token', token }` into the iframe. The token
  comes from `users.createToken` and is cached for about 12 hours per user.

## Setup

```jsonc
// app package.json
"dependencies": {
  "@mframework/meeovi-discussions": "file:../../../packages/plugins/Social/meeovi-discussions"
}
```

```ts
// nuxt.config.ts
modules: ['@mframework/meeovi-discussions'],
// optional
meeoviDiscussions: {
  // url: 'https://collaborrate.com',
  // types: ['post', 'product', …],   // allowed object types (others are 404)
  // loginPath: '/login',
},
```

```bash
# .env (server-only)
ROCKETCHAT_URL=https://collaborrate.com
ROCKETCHAT_ADMIN_USER_ID=…   # admin account: My Account → Personal Access Tokens
ROCKETCHAT_ADMIN_TOKEN=…
ROCKETCHAT_CREATE_TOKENS_SECRET=…   # = CREATE_TOKENS_FOR_USERS_SECRET on Rocket.Chat
```

Rocket.Chat server requirements:

- `CREATE_TOKENS_FOR_USERS_SECRET=<long random string>` in the Rocket.Chat
  container's environment, and the same value as
  `ROCKETCHAT_CREATE_TOKENS_SECRET` in the app. Rocket.Chat 7+ requires it for
  `users.createToken`.
- Admin → Settings → General → Iframe Integration: "Enable Receive" on. For
  safety, set its "Receive Origins" to the Meeovi site origins rather than `*`.
- The site must not send `X-Frame-Options` / `frame-ancestors` that block the
  Meeovi domains. It doesn't today.

## API

- `GET /api/discussions/:type/:id`: `{ room, messages, signedIn, exists }`.
  Never creates the room.
- `POST /api/discussions/:type/:id/session` with `{ title? }`: for the
  signed-in user, creates the room if needed, adds them as a member, and
  returns `{ room, token, embedUrl }`. Returns 401 when signed out and 503 when
  Rocket.Chat isn't configured.

## Server helpers

```ts
import { recentMessages } from '@mframework/meeovi-discussions/server'
// newest messages from product + outlet discussions (e.g. seller reviews)
const messages = await recentMessages(event, ['product', 'outlet'])
```
