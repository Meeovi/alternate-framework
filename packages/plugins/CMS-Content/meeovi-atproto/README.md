# @mframework/meeovi-atproto

AT Protocol (Bluesky) for M Framework. It is one of the social layer's
federation networks; the federation core is built into `layers/social`.

- **`/client`:** `AtprotoClient`, the full wrapper around `@atproto/api`. It
  covers sessions, profiles, timelines and feeds, posts, likes and reposts,
  follows, mutes and blocks, lists, notifications and search.
  `useAtprotoClient()` returns the signed-in service account.
- **`/auth/plugin`:** `atprotoAuth()`, a better-auth plugin providing
  `/sign-in/atproto`, `/sign-up/atproto` and `/link/atproto`. It is wired up in
  `layers/auth/shared/utils/plugins.ts`.
- **Nitro:** signs in the service account (`globalThis.__atprotoClient`) and
  registers the `atproto` federation network.

## Setup

The social layer registers the module, so apps that extend it get it
automatically.

```ts
modules: ['@mframework/meeovi-atproto'],
meeoviAtproto: {
  // service: 'https://sky.meeovicms.com',  // default: ATPROTO_SERVICE, else the hosted PDS
  // federation: false,                     // don't register the network
},
```

| Env | |
| --- | --- |
| `ATPROTO_SERVICE` | PDS/AppView URL. Defaults to `https://sky.meeovicms.com`. |
| `ATPROTO_IDENTIFIER`, `ATPROTO_APP_PASSWORD` | Service account for server-side reads. This PDS requires a session even for search. Secrets stay server-only. |
| `ALTERNATE_SEARCH_ATPROTO_ENABLED` | `false` keeps Bluesky out of the site search. |
| `ALTERNATE_SEARCH_ATPROTO_SERVICE`, `_IDENTIFIER`, `_PASSWORD` | A different PDS or account for site search only. |

## Site search

The module adds Bluesky posts and profiles to the search layer's federated
`/api/search` as the `atproto` provider (`runtime/search.ts`), registered
through the layer's provider registry. Turn it off with the module option
`search: false`, or with `runtimeConfig.searchProviders.atproto.enabled`.

## Federation network

The network is `id: 'atproto'` with the label "Bluesky". It supports
`status`, `profile`, `feed` and `searchPosts`. Reads go through the service
account, or anonymously when none is configured. Per-user posting, liking and
following stay on `/api/social/atproto/*`.

```
GET /api/social/federation                         → networks + status
GET /api/social/federation/atproto/profile?handle=
GET /api/social/federation/atproto/feed?actor=&limit=
GET /api/social/federation/atproto/search?q=&limit=
```

## Tests

`npm test` runs the mapping and adapter tests, plus live read-only checks
against the public Bluesky AppView and the hosted PDS. Set
`FEDERATION_LIVE=0` to skip the live checks when offline.
