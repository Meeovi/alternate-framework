<template>
  <!-- Where a note, profile or list from another network came from.
       Everything from Bluesky and the Fediverse opens on Meeovi; this is
       the only link to the original, kept for attribution. -->
  <aside v-if="href" class="sourceAttribution text-body-2 text-medium-emphasis" aria-label="Source">
    <v-icon :icon="icon" size="small" class="me-1" />
    <span>{{ sentence }}</span>
    <a :href="href" target="_blank" rel="noopener noreferrer nofollow" class="ms-1">View the original on {{ host }}</a>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NETWORK_LABELS } from '../../utils/postPath'

const props = defineProps<{
  /** The original's address (bsky.app, a Mastodon instance…). */
  url?: string | null
  /** 'atproto', 'activitypub'. */
  network?: string | null
  /** Who posted or owns it (@handle). */
  handle?: string | null
  kind?: 'note' | 'profile' | 'list'
}>()

// Only real web addresses are linked.
const href = computed(() => {
  try {
    const url = new URL(String(props.url || ''))
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
})
const host = computed(() => (href.value ? new URL(href.value).host.replace(/^www\./, '') : ''))
const where = computed(() => NETWORK_LABELS[props.network || ''] || host.value)
const icon = computed(() => (props.network === 'atproto' ? 'fab fa-bluesky' : props.network === 'activitypub' ? 'fab fa-mastodon' : 'fas fa-up-right-from-square'))
const by = computed(() => (props.handle ? ` by @${props.handle.replace(/^@/, '')}` : ''))

const sentence = computed(() => {
  switch (props.kind) {
    case 'profile': return `This profile is from ${where.value}.`
    case 'list': return `This list was made on ${where.value}${by.value}.`
    default: return `Originally posted on ${where.value}${by.value}.`
  }
})
</script>

<style scoped>
.sourceAttribution {
  display: block;
  overflow-wrap: anywhere;
}
</style>
