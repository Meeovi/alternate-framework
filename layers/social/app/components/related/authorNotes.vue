<template>
  <!-- "Other notes by @username" under a note's discussion: a Meeovi
       member's other notes (their profile, /api/profiles/:id), or a Bluesky
       or Fediverse author's recent notes from that network. -->
  <section v-if="notes.length" class="container py-6 author-notes">
    <h2 class="author-notes__title mb-4">
      Other notes by
      <NuxtLink v-if="profilePath" :to="profilePath">@{{ handle }}</NuxtLink>
      <template v-else>@{{ handle }}</template>
    </h2>
    <v-row>
      <v-col v-for="note in notes" :key="note.id" cols="12" sm="6" md="4" lg="3">
        <postCard :post="note" />
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import postCard from './post.vue'
import { federatedProfilePath } from '../../utils/postPath'

const props = defineProps<{
  /** The note being read: a Directus post, or a federated note (with `network` and `author`). */
  post: Record<string, any> | null | undefined
  federated?: boolean
}>()

const LIMIT = 8

const authorKey = computed(() => props.federated
  ? (props.post?.network && props.post?.author?.handle ? `${props.post.network}:${props.post.author.handle}` : '')
  : String(props.post?.creator_id ?? ''))

type Profile = { username?: string | null, notes?: Record<string, any>[] }

// Below the fold: fetched in the browser, so it never slows the note's server render.
const { data } = useLazyAsyncData(() => `author-notes:${authorKey.value}`, async () => {
  const post = props.post
  if (!authorKey.value || !post) return { handle: '', notes: [] as Record<string, any>[] }
  if (props.federated) {
    const res = await $fetch<{ posts: Record<string, any>[] }>(`/api/social/federation/${encodeURIComponent(post.network)}/feed`, {
      query: { actor: post.author.handle, limit: LIMIT + 1 },
    }).catch(() => ({ posts: [] }))
    return { handle: String(post.author.handle), notes: res.posts ?? [] }
  }
  const profile = await $fetch<Profile>(`/api/profiles/${encodeURIComponent(post.creator_id)}`).catch(() => null)
  return { handle: String(profile?.username || ''), notes: profile?.notes ?? [] }
}, { server: false, watch: [authorKey] })

const handle = computed(() => data.value?.handle || '')
const notes = computed(() => (handle.value ? data.value?.notes ?? [] : [])
  .filter((note) => String(note?.id) !== String(props.post?.id) && (!props.post?.slug || note?.slug !== props.post.slug))
  .slice(0, LIMIT))
const profilePath = computed(() => {
  if (props.federated) return props.post?.author ? federatedProfilePath(props.post.author) : null
  return handle.value ? `/u/${encodeURIComponent(handle.value)}` : null
})
</script>

<style scoped>
/* The site's global h2 is display-sized. */
.author-notes__title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
}
</style>
