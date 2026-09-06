<template>
  <div v-if="session">
    <v-btn
      class="follow-btn"
      :class="{ following: following }"
      @click="onClick"
      variant="text"
      :loading="loading"
      :disabled="loading"
      :aria-pressed="following"
      :size="size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'default'"
    >
      {{ following ? unfollowLabel : followLabel }}
    </v-btn>
  </div>
  <div v-else>
    <v-btn class="follow-btn" disabled variant="outlined">Sign in to follow</v-btn>
  </div>
  <p v-if="errorMessage" class="follow-btn-error">{{ errorMessage }}</p>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSocialStore } from '../../stores/social'

export type DirectusTargetType = 'users' | 'spaces' | 'outlets' | string

const props = withDefaults(
  defineProps<{
    entityType: DirectusTargetType
    id: string
    initialFollowing?: boolean
    followLabel?: string
    unfollowLabel?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    initialFollowing: undefined,
    followLabel: 'Follow',
    unfollowLabel: 'Following',
    size: 'md'
  }
)

const emit = defineEmits(['update:following', 'change'])

const socialStore = useSocialStore()

// Plain `window.fetch` rather than Nuxt's auto-imported `$fetch`, for the
// per-card requests below (follow-status / follow) — a native `fetch()`
// to these same-origin endpoints has none of $fetch's request
// interception/dedup machinery to interact badly with the many
// simultaneous, identical-looking calls a grid of these buttons produces.
// The session check itself is *not* done here at all any more — see
// `socialStore.fetchSession()` in stores/social.ts for why (real root
// cause of the long-standing "Sign in to follow" bug on grid pages: one
// get-session call per card, serialized server-side).
async function getJson(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, { ...init, headers: { ...(init?.headers as any), 'Content-Type': 'application/json' } })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const message = body?.statusMessage || body?.message || `Request to ${url} failed (${res.status})`
    throw new Error(message)
  }
  return body
}

const session = ref<any>(null)

const following = ref<boolean>(props.initialFollowing ?? false)
const loading = ref(false)
const errorMessage = ref<string | null>(null)

// atprotoActorToSocialProfile() (see
// server/utils/atproto-normalize.ts) prefixes atproto-sourced member ids
// with "atproto:{did}" — routed through the atproto-specific follow
// endpoints below instead of the Directus `follows` collection, which has
// no notion of an atproto DID as a target_id.
const atprotoDid = computed(() => props.id?.startsWith('atproto:') ? props.id.slice('atproto:'.length) : null)

watch(
  () => props.initialFollowing,
  (newVal: boolean | undefined) => {
    if (newVal !== undefined) following.value = newVal
  }
)

onMounted(async () => {
  await socialStore.fetchSession()
  session.value = socialStore.session

  if (!session.value) return

  // 1. Check registry cache (populated by an earlier toggleFollow() this session)
  const followRegistry = socialStore.followRegistry as unknown as Record<string, boolean>
  if (followRegistry?.[props.id] !== undefined) {
    following.value = followRegistry[props.id]!
    return
  }

  // 2. socialStore.isFollowing() only ever reflects followRegistry, which
  // starts empty on every page load — it never reads the database, so the
  // button always reset to "Follow" on refresh regardless of actual state.
  // Ask the server, which is the source of truth.
  if (props.initialFollowing === undefined) {
    loading.value = true
    try {
      const status = atprotoDid.value
        ? await getJson(`/api/social/atproto/follow-status?targetDid=${encodeURIComponent(atprotoDid.value)}`)
        : await getJson(`/api/social/follow-status?targetType=${encodeURIComponent(props.entityType)}&targetId=${encodeURIComponent(props.id)}`)
      following.value = Boolean(status?.following)
      followRegistry[props.id] = following.value
    } catch (_) {
      following.value = false
    } finally {
      loading.value = false
    }
  }
})

async function onClick() {
  if (loading.value) return
  loading.value = true
  errorMessage.value = null

  try {
    const followRegistry = socialStore.followRegistry as unknown as Record<string, boolean>

    if (atprotoDid.value) {
      const result = await getJson('/api/social/atproto/follow', {
        method: 'POST',
        body: JSON.stringify({ targetDid: atprotoDid.value }),
      })
      following.value = Boolean(result?.following)
      // Same registry cache the Directus path populates below — without
      // this, re-rendering this exact card (e.g. navigating away and
      // back) skipped straight to the follow-status network request
      // instead of the fast cache-hit path onMounted's step 1 already
      // checks for.
      followRegistry[props.id] = following.value
    } else {
      await socialStore.toggleFollow(props.id, props.entityType)
      following.value = followRegistry?.[props.id] ?? !following.value
    }

    emit('update:following', following.value)
    emit('change', following.value)
  } catch (error: any) {
    console.error('Failed to change association status:', error)
    errorMessage.value = error?.message || 'Failed to update follow status'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.follow-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  text-transform: none;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  color: black;
}
.follow-btn.following {
  background: #f3f4f6 !important;
  color: #374151 !important;
}
.follow-btn-error {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #b91c1c;
}
</style>
