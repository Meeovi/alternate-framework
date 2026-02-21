# @mframework/social

A powerful, backend‑agnostic social integration layer for Meeovi.
Supports ATProto (Bluesky), Mastodon, WordPress/BuddyPress, and any custom social backend.

## ✨ Features

- Pluggable social providers
- Unified `useSocial()` composable
- Unified activity feed abstraction
- Caching (TTL‑based)
- Stale‑While‑Revalidate (SWR) background refresh
- Retry + exponential backoff
- Provider‑specific rate‑limit strategies
- Analytics hooks (per‑provider metrics)
- Unified error model

## 📦 Installation

```sh
npm install @mframework/social
```

## Quick Usage

```ts
import { useSocial } from '@mframework/social'

const { getActivityFeed } = useSocial()
const feed = await getActivityFeed('sebastian')
```

## Providers

A provider implements the `SocialProvider` interface:

```ts
export interface SocialProvider {
  getProfile(handle: string): Promise<SocialProfile>
  listPosts(handle: string): Promise<SocialPost[]>
  createPost?(content: string): Promise<SocialPost>
}
```

Register providers with `registerSocialProvider('mastodon', MastodonProvider)`.

## Advanced features

- Caching
- SWR (Stale‑While‑Revalidate)
- Retry + Backoff
- Provider-specific rate limits
- Metrics

## Folder Structure (high level)

```
src/
  providers/
  config/
  registry/
  useSocial/
  cache/
  retry/
  swr/
  rateLimit/
  metrics/
  utils/
```

## Mastodon / Masto integration

This layer includes a Mastodon provider that by default proxies requests through the auth layer endpoint `/api/masto`.

### Environment variables

- `MASTO_BASE_URL` — Optional. If set on the server, this will be used as the upstream Mastodon instance base URL (e.g. `https://mastodon.social`). If not set, the social layer defaults to `/api/masto` which proxies via the auth layer.
- `MASTO_API_KEY` — Optional. App-level API key used when proxying requests (sent as `Authorization: Bearer <MASTO_API_KEY>`).

### How to store user Mastodon tokens in Prisma

To create user-scoped Mastodon clients (so users can post as themselves), store the access token and optional instance in your `users` table. Example Prisma migration/shape (simplified):

```prisma
model users {
  id                    String @id @db.Uuid
  email                 String?
  name                  String?
  mastodonAccessToken   String? // optional - user's token
  mastodonInstance      String? // optional - user preferred instance (e.g. mastodon.social)
  // other fields...
}
```

When a user logs in or connects a Mastodon account, save the token to `mastodonAccessToken` (or under a `socialTokens` JSON column). The `layers/auth/masto.js` helper looks for `mastodonAccessToken` and `mastodonInstance` when creating a per-user Mastodon client.

### Server runtime configuration (Nuxt)

This project includes a small server plugin that sets `setSocialConfig(...)` at runtime using environment variables and Nuxt runtime config. At runtime the social composables will call `getSocialConfig()` and use the configured `baseUrl`/`apiKey`.

### Usage notes

- To use the proxy, client code should call the social composables as usual (they will use `getSocialConfig().baseUrl`). If you need direct proxy calls, request `/api/masto/api/v1/...` which will forward to the upstream instance.
- Mutating endpoints (POST/PUT/PATCH/DELETE) are protected and require an authenticated session.

***

For more details and examples, see the `layers/social` source and the `layers/auth` mastodon proxy helper.
