# The social layer as a federation client

**Started:** 29 October 2026, on the **`post-launch`** branch, which holds all after-launch work. It's not in the 31 October soft launch; it must be ready to merge by **30 November**, before the hard launch on 1 December 2026.
**Goal:** the social layer is a client over federation networks. Every social feature — notes, timelines, likes, reposts, follows, profiles, hashtags and lists — goes through one contract. The networks are:

| Network | Plugin | What it is |
|---|---|---|
| `directus` (shown as "Meeovi") | built into `layers/social` | This site's own members, notes and lists, stored in Directus and better-auth |
| `atproto` (Bluesky) | `@mframework/meeovi-atproto` | Bluesky and any AT Protocol server |
| `activitypub` (Fediverse) | `@mframework/meeovi-activitypub` | Mastodon and the wider Fediverse |

Adding a network means writing a plugin. Nothing in the layer changes.

## Two halves of the contract

The contract is in `layers/social/shared/types/federation.ts`. Each plugin keeps a copy of it.

1. **Reading as the site:** `profile`, `feed`, `searchPosts`, `thread`. These read public data with the site's own service account, if the network needs one. Hashtag pages, Bluesky profiles (`/u/<handle>`) and Bluesky notes (`/connect/note/@<handle>/<key>`) already use them.
2. **Acting as a member:** `forMember(member)` returns a `FederationMemberSession`, or null if the member isn't connected to that network. A session can offer:
   - `timeline`
   - `publish`, which also posts replies
   - `like` and `unlike`, `repost` and `unrepost`, `follow` and `unfollow`
   - `lists`, `list`, `createList`, `updateList` and `deleteList`
   - `addToList` and `removeFromList`

   A network implements only what it supports. Routes answer 501 for the rest, and the client hides those buttons (`can` in `/api/social/client/networks`).

The layer stores each member's credentials and passes them to the plugin (`server/utils/federation-members.ts`), so plugins never touch the site's database:
- **Bluesky:** the AT Protocol session saved when the member signs in with Bluesky (`atproto_sessions`). Refreshed tokens are written back.
- **Meeovi:** nothing to store. Every member has a session.
- **Fediverse:** nothing yet. Members can't sign in with a Fediverse account, so there's no session to act as. See phase 4.

## The client API

These routes need a signed-in member. Ids are opaque (`at://` URIs, Directus numbers), so they go in the query string, not the path.

| Route | Does |
|---|---|
| `GET /api/social/client/networks` | Each network: connected or not, the member's account there, and what they can do |
| `GET /api/social/client/timeline` | Timelines from every connected network, merged, newest first |
| `POST /api/social/client/notes` | `{ network, text, replyTo? }` |
| `POST /api/social/client/actions` | `{ network, action, target }`: like, unlike, repost, unrepost, follow, unfollow |
| `GET /api/social/client/lists` | The member's lists on every connected network |
| `POST /api/social/client/lists` | `{ network, name, description?, visibility?, type? }` |
| `GET`, `PATCH`, `DELETE /api/social/client/list?network=&id=` | One list (with its items) |
| `POST`, `DELETE /api/social/client/list/items?network=&id=` | Add (`{ kind, actor \| post \| id }`) or remove (`&item=`) |

Creating or editing a list and posting a note go through Turnstile. The rules are in `layers/shared/shared/formProtection.ts`.

A network that fails or times out is reported in `errors`. The other networks still answer.

## Lists across networks

| | Meeovi lists | Bluesky lists | Fediverse lists |
|---|---|---|---|
| Hold | Products (Directus or the store), vibez, spaces, notes | Accounts (curate lists; moderation lists are left out) | Accounts |
| Stored in | Directus `lists` plus its junction tables (`listItemKinds.ts`) | The member's own Bluesky repository (`app.bsky.graph.list` / `listitem`) | Their Mastodon account |
| Status | Done (phase 1) | Done (phase 1) | Phase 4 |

An item's id is whatever its network uses to remove it. For Meeovi that's `<kind>:<junction row id>`; for Bluesky it's the list item's `at://` URI. Meeovi lists only read and write lists the member owns. Another member's list behaves as if it doesn't exist (404).

## Feature by feature

| Feature | Today | Federated through | Phase |
|---|---|---|---|
| Lists | `/api/social/lists`, `/api/social/list-saved` (Directus only) | `/api/social/client/list*` (Meeovi and Bluesky) | API: 1 (done). `/lists` pages: 2 |
| Hashtag pages | Bluesky search plus tagged products | `searchPosts` on every network | Reads done; merging the Fediverse: 2 |
| Note page | Directus, or Bluesky through `thread` | `thread` on every network | Fediverse `thread`: 2 |
| Profiles | `/api/profiles/:slug` (Meeovi, or Bluesky) | `profile` and `feed` | Fediverse handles (`user@host`): 2 |
| Home timeline | `/api/social/feed`, `/api/social/atproto/timeline` | `/api/social/client/timeline` | API: 1 (done). `/connect/notes`: 3 |
| Like, repost, follow | `/api/social/atproto/like`, `/follow` and the Directus follow route | `/api/social/client/actions` | API: 1 (done). Note card buttons: 3 |
| Writing a note | Composer to Directus, plus `/api/social/publish` to Bluesky | `/api/social/client/notes` | API: 1 (done). Composer: 3 |
| Meeovi's own timeline, notes, likes and follows on the Meeovi network | Directus routes | The `directus` member session | 3 |
| Fediverse as the member | None | Mastodon OAuth sign-in, then `forMember` on `activitypub` | 4 |
| Old routes (`/api/social/atproto/*`, `/api/social/lists*`) | In use | Removed once nothing calls them | 5 |

### Phases

1. **Contract and API (done).** The member half of the contract; member sessions for Meeovi (lists) and Bluesky (timeline, notes, likes, reposts, follows, lists); the `/api/social/client` routes; tests.
2. **Lists on the federation.** Turn `/lists` and `/lists/list/<slug>` into the client:
   - Lists from every network appear together, each marked with its network.
   - Bluesky lists open at `/lists/list/atproto:<uri>`.
   - "Add to list" uses `addToList`.
   - Also in this phase: the Fediverse in hashtag search, Fediverse `thread` and profiles.
3. **Notes on the federation.** The note card's buttons (like, repost, reply) work on the note's own network. `/connect/notes` shows the merged timeline. The composer can post to Meeovi, Bluesky or both. The Meeovi member session grows `timeline`, `publish`, `like` (ratings), `follow`.
4. **Fediverse sign-in.** Mastodon OAuth, so a member can connect a Fediverse account (any instance), with a stored token and `forMember` on `activitypub`, including Mastodon lists.
5. **Clean-up.** Remove the old network-specific routes and the alternate-sdk social driver once nothing uses them.

## Testing

- `layers/social/test/__tests__/federation-members.spec.ts`: member sessions, stored credentials, failures, capabilities.
- `layers/social/test/__tests__/federation-directus-member.spec.ts`: Meeovi lists (ownership, create, rename, delete, items, duplicates, refusals).
- `packages/plugins/Social/meeovi-atproto/test/member.test.ts`: Bluesky likes, follows and reposts (each done only once), reply threading, lists.
- Live, read-only: the service account's Bluesky timeline and lists through the member session (29 October). Writing to Bluesky (lists, notes, likes) still needs a test with a throwaway Bluesky account, created and deleted for the test.

### Content from other networks stays on Meeovi (5 November 2026)

Everything from Bluesky and the Fediverse opens on Meeovi, never on its original site. The original is only credited, at the bottom of its page, by `blocks/sourceAttribution.vue`:

| Content | Page on Meeovi | Credit |
| --- | --- | --- |
| Bluesky note | `/connect/note/@<handle>/<rkey>` | "Originally posted on Bluesky by @…", linking to bsky.app |
| Fediverse note | `/connect/note/@<user@instance>/<status id>` (`thread` on `activitypub`) | the same, linking to the instance |
| Profiles | `/u/<handle>` (Bluesky) and `/u/<user@instance>` (Fediverse); `/api/profiles` returns `source` | "This profile is from …" |
| Bluesky lists | `/lists/list/atproto:<at:// URI>` (the network's public `list` capability) | "This list was made on Bluesky" |
| Search hits | `path` to the page above; the original is kept as `sourceUrl` | — |

`FederatedPost.url`, `FederatedActor.url` and `FederatedList.url` are the originals: use them for credit only, never as a link target. Hashtag pages show Fediverse notes as well as Bluesky ones.
