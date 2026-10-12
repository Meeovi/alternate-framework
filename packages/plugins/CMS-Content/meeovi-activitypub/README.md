# @mframework/meeovi-activitypub

ActivityPub (Mastodon and the Mastodon-API Fediverse: GoToSocial, Akkoma,
Pleroma, …) for M Framework, built on [masto.js](https://github.com/neet/masto.js).
It is one of the social layer's federation networks; the federation core is
built into `layers/social`.

- **`/client`:** masto.js client factories (`createMastodonPublicClient`,
  `createMastodonRestClient`, `createMastodonSessionClients`, …).
- **`/tools/*`:** helpers over a masto client for statuses, publishing, drafts,
  media upload, timelines and streaming, notifications, relationships,
  search, translation and routes.
- **`/protocol/*`:** WebFinger, ActivityStreams and ForgeFed helpers for
  servers that don't speak the Mastodon API.
- **Nitro:** registers the `activitypub` federation network.

## Setup

The social layer registers the module, so apps that extend it get it
automatically.

```ts
modules: ['@mframework/meeovi-activitypub'],
meeoviActivitypub: {
  // server: 'https://mastodon.social',  // default: ACTIVITYPUB_SERVER_URL
  // federation: false,
},
```

| Env | |
| --- | --- |
| `ACTIVITYPUB_SERVER_URL` | Mastodon-API instance. Defaults to `https://mastodon.social`. |
| `ACTIVITYPUB_ACCESS_TOKEN` | Optional token for the deployment's own account on that instance. It stays server-only. |

## Federation network

The network is `id: 'activitypub'` with the label "Fediverse".

- **Without a token:** read-only. It supports `status`, `profile`, `feed` and
  `searchPosts`. Mastodon only lets signed-in accounts search post text, so
  search uses the query's first word as a hashtag (`#fediverse news` →
  `#fediverse`).
- **With a token:** full-text post search and `publish`, which powers
  `POST /api/social/publish`.

```
GET /api/social/federation/activitypub/profile?handle=Mastodon
GET /api/social/federation/activitypub/feed?actor=Mastodon&limit=
GET /api/social/federation/activitypub/search?q=%23fediverse
```

## Tests

`npm test` runs the mapping tests, plus live read-only checks against
mastodon.social: status, profile, feed, hashtag search and WebFinger. Set
`FEDERATION_LIVE=0` to skip the live checks, or `ACTIVITYPUB_TEST_SERVER`
to point them at another server.
