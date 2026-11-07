# @mframework/meeovi-zot

Zot (Hubzilla and Streams: nomadic identity, where channels can move between
hubs) for M Framework. It is one of the social layer's federation networks:
`id: 'zot'`, label "Hubzilla & Streams (Zot)".

- **Anyone:** a channel's profile, found with WebFinger and read with Zot
  discovery (the channel URL as `application/x-zot+json`). Its recent public
  posts and single posts come through the ActivityPub side most hubs run
  (Hubzilla's pubcrawl add-on; Streams has it built in). Hubs without it
  show the profile only.
- **Members who connect their channel** in Settings → Accounts (hub, channel
  nickname, password): their network stream, posting and replying. These go
  through the hub's own API, `api/z/1.0` (`verify`, `network/stream`,
  `item/update`), with HTTP Basic auth. That API has no like, boost or follow
  calls, so those stay on the hub.

## Setup

The social layer registers the module.

```ts
modules: ['@mframework/meeovi-zot'],
meeoviZot: { /* federation: false */ },
```

No environment variables are needed. The password is stored the same way as
for meeovi-ostatus: AES-256-GCM in `federation_connections`, never sent back,
deleted when the member disconnects.

## Ids

A post's id is its Zot message id (a URL) in base64url. Note pages are
`/connect/note/@channel@hub/zot:<id>`. Post bodies are BBCode;
`runtime/bbcode.ts` turns them into simple HTML, which the site sanitizes
again before showing it, and into plain text.

`runtime/safe-fetch.ts` and `runtime/webfinger.ts` are the same as in
meeovi-ostatus; keep them in step.

## Tests

`npm test` (offline).
