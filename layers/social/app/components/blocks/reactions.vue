<template>
  <div class="row">
    <Picker :data="emojiIndex" set="twitter" @select="onSelect" />
  </div>

  <div class="row">
    <div>{{ emojisOutput }}</div>
    <div v-if="isAtprotoPost" class="atproto-like-status">
      <v-icon :icon="liked ? 'fas fa-heart' : 'far fa-heart'" :color="liked ? 'red' : undefined" size="small" />
      <span v-if="liking">Syncing…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEmojiPicker } from "../../composables/content/useEmojiPicker"

const props = defineProps<{
  /** post.reactions.reactions_id for a Directus post, or an atproto
   *  post's at:// URI (see post.vue's `<reactions>` binding and
   *  server/utils/atproto-normalize.ts's atprotoPostToPostCard). */
  contentId?: string | null
  /** post.type — 'atproto_post' routes emoji picks to a real atproto like
   *  instead of the (purely cosmetic, unpersisted) local emoji trail
   *  below; any other value leaves this component's existing behavior
   *  untouched. */
  contentType?: string | null
  /** Only used for atproto posts — lets POST /api/social/atproto/like
   *  skip a lookup round trip when already known. */
  contentCid?: string | null
}>()

const { emojiIndex, emojisOutput, addEmoji } = useEmojiPicker()

const isAtprotoPost = computed(() => props.contentType === 'atproto_post' && Boolean(props.contentId))
const liked = ref(false)
const liking = ref(false)

async function onSelect(emoji: any) {
  addEmoji(emoji)

  // Atproto has no arbitrary-emoji reaction concept, only a single like —
  // any emoji picked on an atproto-sourced post maps to that one like,
  // same as clicking a heart icon would on bsky.app itself.
  if (!isAtprotoPost.value || liking.value) return

  liking.value = true
  try {
    const result = await $fetch('/api/social/atproto/like', {
      method: 'POST',
      body: { uri: props.contentId, cid: props.contentCid },
    })
    liked.value = Boolean(result?.liked)
  } catch (error) {
    console.error('Failed to toggle atproto like:', error)
  } finally {
    liking.value = false
  }
}
</script>

<style>
.row { display: flex; }
.row > * { margin: auto; }
.atproto-like-status { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; }
</style>
