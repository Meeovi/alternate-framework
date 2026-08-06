<template>
  <!-- Using your existing loggedIn state from Better Auth -->
  <div v-if="loggedIn">
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
    <v-btn class="follow-btn" disabled variant="outlined">Sign in to join</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSocialStore } from '../../stores/social'

const { useAuth } = useNuxtApp() as any
// Explicitly type check against Directus collection targets
export type DirectusTargetType = 'users' | 'spaces'

const props = defineProps({
  // Align with Directus M2A collection strings ('users', 'spaces')
  entityType: { type: String as () => DirectusTargetType, required: true },
  entityId: { type: String, required: true },
  initialFollowing: { type: Boolean, default: undefined },
  followLabel: { type: String, default: 'Join' },
  unfollowLabel: { type: String, default: 'Leave' },
  size: { type: String as () => 'sm' | 'md' | 'lg', default: 'md' }
})

const emit = defineEmits(['update:following', 'change'])

const socialStore = useSocialStore()
const { loggedIn } = useAuth()

const following = ref<boolean>(props.initialFollowing ?? false)
const loading = ref(false)

// Sync up local state if a dynamic parent updates it asynchronously
watch(() => props.initialFollowing, (newVal) => {
  if (newVal !== undefined) following.value = newVal
})

onMounted(async () => {
  if (!loggedIn.value) return

  // Check if the state already lives in your Pinia social registry first to save an API hit
  if (socialStore.followRegistry[props.entityId] !== undefined) {
    following.value = socialStore.followRegistry[props.entityId]
    return
  }

  // Fallback: If initialState wasn't passed, look it up through your Directus-backed store
  if (props.initialFollowing === undefined) {
    loading.value = true
    try {
      // Assuming your useFollow was migrated inside socialStore or an update endpoint
      const isFollowingTarget = socialStore.isFollowing(props.entityId).value
      following.value = isFollowingTarget
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
    // Fire action directly via your unified Pinia store handler
    await socialStore.toggleFollow(props.entityId, props.entityType)
    
    // Read the resulting mutated reactive value straight out of the store registry
    following.value = socialStore.followRegistry[props.entityId] ?? false
    
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
  text-transform: none; /* Keeps standard casual styling clean over Vuetify force-caps */
  border: 1px solid rgba(0,0,0,0.08);
  background: white;
}
.follow-btn.following {
  background: #f3f4f6 !important;
  color: #374151 !important;
}
</style>