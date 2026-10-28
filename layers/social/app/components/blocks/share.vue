<template>
  <v-btn class="shareBtn" :disabled="!isSupported" @click="startShare" variant="text" prepend-icon="fas fa-share-nodes" size="medium"
    :title="isSupported ? 'Share' : 'Sharing isn\'t supported in this browser'" :aria-label="title ? `Share ${title}` : 'Share'" />
</template>

<script setup lang="ts">
import { useShare } from '@vueuse/core'

// What to share: a path on this site (e.g. a note's page) or a full URL;
// without one, the page you're on.
const props = defineProps<{ url?: string | null, title?: string | null }>()

const { share, isSupported } = useShare()

async function startShare() {
  const url = props.url ? new URL(props.url, window.location.origin).href : window.location.href
  try {
    await share({ title: props.title || 'Meeovi', text: '', url })
  } catch (err) {
    console.error('Error sharing:', err)
  }
}
</script>
