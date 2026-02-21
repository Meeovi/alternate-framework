<template>
  <UButton
    class="follow-btn"
    :class="{ following: !!following }"
    @click="onClick"
    :disabled="loading"
    :aria-pressed="!!following"
  >
    <span v-if="loading">…</span>
    <span v-else>{{ following ? unfollowLabel : followLabel }}</span>
  </UButton>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useFollow, { type EntityType } from '../../composables/useFollow'

const props = defineProps({
  entityType: { type: String as () => EntityType, required: true },
  entityId: { type: [String, Number], required: true },
  initialFollowing: { type: Boolean as () => boolean | undefined, default: undefined },
  followLabel: { type: String, default: 'Follow' },
  unfollowLabel: { type: String, default: 'Unfollow' },
  size: { type: String as () => 'sm' | 'md' | 'lg', default: 'md' }
})

const emit = defineEmits(['update:following', 'change'])

const { isFollowing, toggleFollow } = useFollow()

const following = ref<boolean | undefined>(props.initialFollowing)
const loading = ref(false)

onMounted(async () => {
  if (following.value === undefined) {
    try {
      const res = await isFollowing(props.entityType, props.entityId)
      following.value = typeof res === 'boolean' ? res : !!res?.following
    } catch (_) {
      following.value = false
    }
  }
})

async function onClick() {
  if (loading.value) return
  loading.value = true
  try {
    const res = await toggleFollow(props.entityType, props.entityId)
    if (res && typeof res.following !== 'undefined') {
      following.value = !!res.following
    } else if (typeof res === 'boolean') {
      following.value = res
    } else {
      following.value = !following.value
    }
    emit('update:following', following.value)
    emit('change', following.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.follow-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.08);
  background: white;
  cursor: pointer;
}
.follow-btn.following {
  background: #f3f4f6;
}
.follow-btn:disabled { opacity: 0.6; cursor: not-allowed }
</style>
