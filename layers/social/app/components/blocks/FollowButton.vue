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
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSocialStore } from '../../stores/social'
import { useAuth } from '#auth/app/composables/useAuth'

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

// useSession() (called with no arguments) hands back a shared,
// reference-counted nanostore atom whose fetch is scheduled via
// setTimeout(fn, 0) inside onMount and cancelled on unsubscribe. On
// pages that render many FollowButtons at once (e.g. connect/members),
// unrelated hydration-mismatch remounts elsewhere on the page cycle
// that shared subscription's refcount, cancelling the scheduled fetch
// before it ever reaches the network — the button gets stuck showing
// "Sign in to follow" even when logged in. A plain one-shot $fetch
// sidesteps that shared lifecycle entirely.
const session = ref<any>(null)

const following = ref<boolean>(props.initialFollowing ?? false)
const loading = ref(false)

watch(
  () => props.initialFollowing,
  (newVal: boolean | undefined) => {
    if (newVal !== undefined) following.value = newVal
  }
)

onMounted(async () => {
  const res = await useAuth().$fetch('/get-session').catch(() => null)
  session.value = res?.data ?? null

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
      const status = await $fetch('/api/social/follow-status', {
        params: { targetType: props.entityType, targetId: props.id },
      })
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

  try {
    await socialStore.toggleFollow(props.id, props.entityType)
    const followRegistry = socialStore.followRegistry as unknown as Record<string, boolean>
    following.value = followRegistry?.[props.id] ?? !following.value

    emit('update:following', following.value)
    emit('change', following.value)
  } catch (error) {
    console.error('Failed to change association status:', error)
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
</style>