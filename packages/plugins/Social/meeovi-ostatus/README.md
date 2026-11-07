# @mframework/meeovi-ostatus

OStatus (GNU social, Friendica, postActiv and other servers from before
ActivityPub) for M Framework. It is one of the social layer's federation
networks: `id: 'ostatus'`, label "GNU social (OStatus)".

- **Anyone:** profiles and recent posts of OStatus accounts, found with
  WebFinger and read from their Atom feed (`updates-from` link). One post,
  with its direct replies, comes from its server's public API.
- **Members who connect their account** in Settings → Accounts (server,
  username, password): their home timeline, posting, replying, deleting
  their own posts, favourites, repeats and follows. These go through the
  server's GNU-social-compatible API (`/api/statuses/…`, HTTP Basic auth).

## Setup

The social layer registers the module.

```ts
modules: ['@mframework/meeovi-ostatus'],
meeoviOstatus: { /* federation: false */ },
```

No environment variables are needed.

## What members connect

Those servers only offer password sign-in for apps. The social layer checks
the password against the member's server, then stores it AES-256-GCM
encrypted in `federation_connections`. The key is `FEDERATION_CREDENTIALS_KEY`,
or one derived from `BETTER_AUTH_SECRET`. The password is never sent back to
the browser. Disconnecting deletes it, and so does deleting the account.
Members get 5 connect attempts per 10 minutes.

## Ids

GNU social ids only mean something on the server that issued them, so a post
is `<host>~<id>` and an account is `<host>~<user id>`. A member can like,
repeat or follow only what their own server knows. For anything else they're
told to open it on their server. Note pages are
`/connect/note/@user@host/ostatus:<host>~<id>`.

## Safety

Every request goes through `runtime/safe-fetch.ts`. It allows https on port
443 only, and checks each address when connecting, so private, loopback and
link-local addresses are refused even after a redirect or a DNS change. It
follows at most 3 redirects and reads at most 2 MB of each response.

## Tests

`npm test`. These tests are offline: the Atom feed and API answers are
fixtures.
