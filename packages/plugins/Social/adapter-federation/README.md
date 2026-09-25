# nuxt-activitypub

A Nuxt module that integrates [ActivityPub](https://www.w3.org/TR/activitypub/) into your Nuxt application.  
It provides a preconfigured HTTP client for ActivityPub endpoints and composables for common federation tasks.

---

## 🚀 Features
- Injects an ActivityPub client into your Nuxt app (`$activitypub`).
- Configurable server endpoint via `nuxt.config.ts`.
- Provides a `useActivitypub` composable for inbox/outbox queries and posting activities.
- Secure by default: runtime config, no secrets hardcoded.

---

## Usage

const { getInbox } = useActivitypub()
const inbox = await getInbox()
console.log(inbox)

const { getOutbox } = useActivitypub()
const outbox = await getOutbox()
console.log(outbox)

const { postActivity } = useActivitypub()
await postActivity({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Note",
  content: "Hello Fediverse from Nuxt!"
})

---

## 📦 Installation

Add the module to your project:

```bash
pnpm add nuxt-activitypub
npm install nuxt-activitypub
yarn add nuxt-activitypub
```

Then, add it to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-activitypub'],

  activitypub: {
    server: 'https://mastodon.social' // or your own ActivityPub server
  }
})
```

---

## AT Protocol (Bluesky)

`src/clients/atproto.ts` is a complete wrapper around the official
[`@atproto/api`](https://www.npmjs.com/package/@atproto/api) SDK —
`AtprotoClient` covers session management, profiles, timelines/feeds,
posting (with hashtag/link/mention facets, images, quote posts, replies),
likes/reposts, the social graph (follow/mute/block/lists), notifications,
and search. It defaults to this deployment's hosted PDS
(`https://sky.meeovicms.com`, see `DEFAULT_ATPROTO_SERVICE`/
`ATPROTO_SERVICE`) but works against any PDS/AppView.

```ts
import { AtprotoClient } from '@mframework/adapter-federation/clients/atproto'

const client = await AtprotoClient.create({ identifier: 'alice.bsky.social', password: 'xxxx-xxxx-xxxx-xxxx' })
const { posts } = await client.getTimeline({ limit: 20 })
await client.createPost({ text: 'Hello from the M Framework! #test' })
```

### Three integration points

- **layers/social** — `useAtprotoClient()` reads a server-side singleton
  bootstrapped by this package's Nuxt module
  (`runtime/server/atproto.ts`, registered via `addServerPlugin`). Add
  `'@mframework/adapter-federation/nuxt'` to `modules` and set
  `ATPROTO_IDENTIFIER`/`ATPROTO_APP_PASSWORD` for a service-account client
  covering read paths (timeline, search) that don't act as a specific user.
- **layers/search** — `layers/search/server/providers/atproto.ts`
  implements the shared `SearchProvider` contract using
  `AtprotoClient#searchPosts`/`#searchActors` against the configured PDS
  (`searchProviders.atproto` in `layers/search/nuxt.config.ts`), federated
  alongside every other search backend by `server/search/federate.ts`.
- **layers/auth** — `src/auth/plugin.ts` exports `atprotoAuth()`, a real
  better-auth plugin adding `POST /sign-in/atproto`: authenticates a
  handle + app password against a PDS, then finds-or-creates the local
  `users` row (keyed on the `atprotoDid`/`atprotoHandle` columns — see
  `layers/auth`'s `20260901120000_add_atproto_identity` migration) and
  issues a normal better-auth session. Wired into
  `layers/auth/shared/utils/plugins.ts`, which also passes
  `onSessionEstablished` to persist the resumable atproto session
  (accessJwt/refreshJwt) into a dedicated `atproto_sessions` table (see
  `20260901130000_add_atproto_sessions`) — that's what lets a signed-in
  user post/like/follow as *themselves* later, not just via the shared
  service-account client. `layers/social/server/utils/atproto.ts`'s
  `getAtprotoClientForUser(userId)` resumes it (auto-persisting a
  refreshed token pair via the same `onSessionChange` mechanism), and
  `POST /api/social/atproto/post` is the first route built on it.

### Env vars

| Var | Used by | Default |
| --- | --- | --- |
| `ATPROTO_SERVICE` | all three integration points | `https://sky.meeovicms.com` |
| `ATPROTO_IDENTIFIER` / `ATPROTO_APP_PASSWORD` | layers/social's service-account bootstrap | unset (bootstrap no-ops) |
