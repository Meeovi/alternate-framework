# @mframework/meeovi-ratings

Universal 1–5 star ratings, which replace likes. Anything can be rated:
posts, vibes, products, lists, radio stations, spaces, outlets, events,
services, stories, characters, and so on. Creators get a **creator rating**,
the average of every rating on content they made, overall and per kind.

```vue
<!-- rate it (signed in); guests see the average + "Sign in to rate" -->
<MeeoviRating type="post" :id="post.id" />

<!-- display only (cards, compare tables) -->
<MeeoviRating type="product" :id="product.id" readonly size="x-small" />

<!-- a creator's score -->
<MeeoviCreatorRating :user-id="user.id" />
```

- Click a star to rate. Click your current rating again to remove it.
- One rating per person per item; rating again updates it. The rater always
  comes from the session.
- Item types listed in `owners` record their creator. Creators can't rate
  their own items, and those items count toward the creator rating.
- Every `<MeeoviRating>` on a page is loaded with **one** request: the client
  groups them into `GET /api/ratings?items=…`.

Storage is the Directus collection `content_ratings`, with fields
`target_type`, `target_id`, `user_id` (better-auth id), `rating` (1–5) and
dates.

## Setup

```jsonc
// app package.json
"dependencies": {
  "@mframework/meeovi-ratings": "file:../../../packages/plugins/Social/meeovi-ratings"
}
```

```ts
// nuxt.config.ts
modules: ['@mframework/meeovi-ratings'],
// optional
meeoviRatings: {
  // types: ['post', 'shorts', 'product', …],       // rateable types; others 404
  // owners: {                                       // items that record their creator
  //   shorts: { collection: 'shorts', field: 'creator_id', label: 'Vibes' },
  //   post:   { collection: 'posts',  field: 'creator_id', label: 'Posts' },
  //   station:{ collection: 'radios', field: 'creator_id', label: 'Radio' },
  // },
},
```

Directus URL / token default to `DIRECTUS_URL` / `NUXTUS_DIRECTUS_STATIC_TOKEN`
(override with `MEEOVI_RATINGS_DIRECTUS_URL` / `_TOKEN`). They stay server-side.

To add a kind of content to creator ratings, give its collection a creator id
field (the better-auth user id, stamped server-side as the CMS proxy does for
`creator_id`) and add it to `owners`.

## API

- `GET /api/ratings?items=post:12,product:9`: for up to 100 items, returns
  `{ signedIn, items: { "post:12": { average, count, mine, canRate, own } } }`.
- `PUT /api/ratings/:type/:id` with `{ rating: 1–5 }`: rate or re-rate. Returns
  401 when signed out, 403 on your own item, and 400 when the rating isn't a
  whole number from 1 to 5.
- `DELETE /api/ratings/:type/:id`: remove your rating.
- `GET /api/ratings/creator/:userId`: `{ average, count, byType: [{ type, label, average, count }] }`.

Server helpers: `import { summaries, creatorRating } from '@mframework/meeovi-ratings/server'`.
