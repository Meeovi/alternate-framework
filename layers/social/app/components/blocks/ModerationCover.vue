<template>
  <!-- Nothing to do -->
  <div v-if="!moderation || revealed || onlySignedIn" class="moderation-cover">
    <slot />
  </div>

  <!-- The author shares only with signed-in members -->
  <div v-else-if="moderation.signedInOnly && signedIn === false" class="moderation-cover__notice pa-4 text-center">
    <v-icon icon="fas fa-lock" class="mb-2" />
    <p class="text-body-2 mb-3">This author only shares with signed-in members.</p>
    <v-btn size="small" variant="tonal" :to="`/login?redirect=${encodeURIComponent(route.fullPath)}`">Sign in</v-btn>
  </div>

  <!-- Blur: the content shows, its images and video are covered -->
  <div v-else-if="moderation.action === 'blur'" class="moderation-cover moderation-cover--blur">
    <slot />
    <div class="moderation-cover__veil">
      <v-icon icon="fas fa-eye-slash" class="mb-1" />
      <div class="text-body-2 mb-2">{{ reasonText }}</div>
      <v-btn size="small" variant="flat" color="surface" @click.stop.prevent="revealed = true">Show media</v-btn>
    </div>
  </div>

  <!-- Warn (or signed-in only for a member): a warning over all of it -->
  <div v-else-if="moderation.action !== 'hide'" class="moderation-cover__notice pa-4 text-center">
    <v-icon icon="fas fa-triangle-exclamation" class="mb-2" />
    <p class="text-body-2 mb-1 font-weight-medium">Content warning</p>
    <p v-if="reasonText" class="text-caption text-medium-emphasis mb-3">{{ reasonText }}</p>
    <v-btn size="small" variant="tonal" @click.stop.prevent="revealed = true">Show anyway</v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from '#imports'
import { useSocialStore } from '../../stores/social'

/**
 * Covers Bluesky content according to its moderation labels (the
 * `moderation` the atproto network attaches: Bluesky's labels and
 * Meeovi's Ozone). Hidden content never reaches the page; this handles
 * `warn` (a warning over everything, "Show anyway"), `blur` (images and
 * video blurred, "Show media") and authors who only share with signed-in
 * members.
 *
 *   <ModerationCover :moderation="note.moderation">…note…</ModerationCover>
 *   <ModerationCover v-model:revealed="shown" …> (share one "show" between covers)
 */
const props = defineProps<{
  moderation?: { action: 'hide' | 'blur' | 'warn', reasons: string[], signedInOnly?: boolean } | null
}>()

const route = useRoute()
// v-model:revealed lets two covers of one note open together (its image and text).
const revealed = defineModel<boolean>('revealed', { default: false })
// Unknown until the browser asks (the server render shows the warning).
const signedIn = ref<boolean | null>(null)

onMounted(async () => {
  if (!props.moderation?.signedInOnly) return
  const store = useSocialStore()
  signedIn.value = !!(await store.fetchSession().catch(() => null))
})

// Only "signed-in members" applies, and this viewer isn't known to be signed out.
const onlySignedIn = computed(() => !!props.moderation?.signedInOnly && !props.moderation.reasons.length && signedIn.value !== false)

const NAMES: Record<string, string> = {
  '!warn': 'Flagged by moderators',
  porn: 'Adult content',
  sexual: 'Sexually suggestive',
  'sexual-figurative': 'Sexually suggestive (illustrated)',
  nudity: 'Nudity',
  'graphic-media': 'Graphic media',
  gore: 'Graphic violence',
  misleading: 'Misleading',
  rude: 'Rude',
  intolerant: 'Intolerant',
  threat: 'Threatening',
  'self-harm': 'Self-harm',
}
const name = (value: string) => NAMES[value] || value.replace(/^!/, '').replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
const reasonText = computed(() => [...new Set((props.moderation?.reasons ?? []).map(name))].join(' · '))
</script>

<style scoped>
.moderation-cover--blur {
  position: relative;
}

.moderation-cover--blur :deep(img),
.moderation-cover--blur :deep(video) {
  filter: blur(28px);
}

.moderation-cover__veil {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
}

.moderation-cover__notice {
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.06);
}
</style>
