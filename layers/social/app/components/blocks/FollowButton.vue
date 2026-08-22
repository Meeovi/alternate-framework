<template>
  <div v-if="session">
    <v-btn
      class="follow-btn"
      :class="{ following: following }"
      @click="onClick"
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
import { ref, onMounted, watch } from 'vue'
import { useSocialStore } from '../../stores/social'
import { authClient } from '#auth/lib/auth-client'

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

// Local session ref
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
  // 1. Await the session call directly
  const { data } = await authClient.useSession()
  session.value = data

  if (!session.value) return

  // 2. Check registry cache
  const followRegistry = socialStore.followRegistry as unknown as Record<string, boolean>
  if (followRegistry?.[props.id] !== undefined) {
    following.value = followRegistry[props.id]!
    return
  }

  // 3. Fallback check
  if (props.initialFollowing === undefined) {
    loading.value = true
    try {
      const targetState = socialStore.isFollowing?.(props.id)
      following.value = typeof targetState === 'object' && 'value' in targetState 
        ? targetState.value 
        : Boolean(targetState)
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
}
.follow-btn.following {
  background: #f3f4f6 !important;
  color: #374151 !important;
}
</style>