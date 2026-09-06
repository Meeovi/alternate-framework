// layers/social/server/utils/atproto-normalize.ts
//
// Shapes AtprotoClient's normalized records (AtprotoActorRecord,
// AtprotoPostRecord, AtprotoTrendingTopic) into the exact same shape this
// app's existing Directus-backed pages already expect — SocialProfile-ish
// objects for MemberCard.vue, Directus-post-ish objects for post.vue,
// {slug, name} for tag.vue. Directus data is never touched; these are
// purely additive items merged into the same arrays server-side, so every
// page's own script only needs to concat one more array — the template
// components (memberCard/post/tag) don't need to know an item came from
// atproto at all.
import type { AtprotoActorRecord, AtprotoPostRecord, AtprotoTrendingTopic } from '@mframework/adapter-federation/clients/atproto'

/** MemberCard.vue-compatible shape (see layers/social's SocialProfile type).
 *  `id` is prefixed `atproto:{did}` — FollowButton.vue strips that prefix
 *  back off to call the atproto-specific follow endpoints (see
 *  server/api/social/atproto/follow{,-status}.{post,get}.ts) instead of
 *  the Directus ones whenever it sees this prefix. */
export function atprotoActorToSocialProfile(actor: AtprotoActorRecord) {
  return {
    id: `atproto:${actor.did}`,
    name: actor.displayName || actor.handle,
    avatar: actor.avatar || null,
    title: actor.description || undefined,
    // Deliberately no `username` — MemberCard builds its profile link from
    // it (`/u/{username}`), a route that only understands local app
    // usernames. Leaving it unset keeps the card non-broken-link rather
    // than pointing "Visit Profile" at a page that can't resolve an
    // atproto handle.
    username: undefined,
    roles: ['atproto'],
    // MemberCard reads member.follow?.length as a bare follower count
    // display — Array(n) fakes that without needing real follower rows.
    follow: actor.followersCount ? Array.from({ length: actor.followersCount }) : [],
    lists: [],
    products: [],
  }
}

/** post.vue-compatible shape (Directus `posts` collection fields). `uri`/
 *  `cid` are carried through (beyond what post.vue itself reads) so
 *  reactions.vue can call POST /api/social/atproto/like without a lookup
 *  round trip — see post.vue's `<reactions>` binding. */
export function atprotoPostToPostCard(post: AtprotoPostRecord) {
  return {
    id: `atproto:${post.uri}`,
    type: 'atproto_post',
    uri: post.uri,
    cid: post.cid,
    title: null,
    description: post.text,
    content: post.text,
    date_created: post.createdAt,
    // No local /connect/post/{slug} route exists for an atproto record —
    // point the comment link at the real post on Bluesky instead of a
    // slug that would 404.
    slug: null,
    url: `https://bsky.app/profile/${post.authorHandle}/post/${post.uri.split('/').pop()}`,
    author: {
      name: post.authorDisplayName || post.authorHandle,
      avatar: post.authorAvatar || null,
    },
    file: null,
    audio: null,
    image: post.images?.[0]?.fullsize || null,
    reactions: null,
  }
}

/** tag.vue-compatible shape (Directus `tags` collection fields). */
export function atprotoTopicToTagChip(topic: AtprotoTrendingTopic) {
  return {
    id: `atproto:${topic.topic}`,
    slug: topic.topic.replace(/^#/, ''),
    name: (topic.displayName || topic.topic).replace(/^#/, ''),
  }
}
