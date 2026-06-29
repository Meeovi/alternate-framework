<template>
  <v-btn
    variant="text"
    class="repost-btn"
    :class="{ reposted }"
    :disabled="loading"
    @click="onClick"
    :title="title"
  >
    <v-icon
      :icon="reposted ? 'mdi-repeat' : 'mdi-repeat'"
      class="repost-icon"
    />

    <span class="repost-label">
      <template v-if="loading">…</template>
      <template v-else>
        {{ reposted ? unRepostLabel : repostLabel }}
      </template>
    </span>

    <span v-if="count !== undefined" class="repost-count">
      {{ count }}
    </span>
  </v-btn>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePosts } from '../../../composables/posts/usePosts'

const props = defineProps({
  postId: { type: [String, Number], required: true },
  initialReposted: { type: Boolean, default: undefined },
  repostLabel: { type: String, default: 'Repost' },
  unRepostLabel: { type: String, default: 'Undo Repost' },
  title: { type: String, default: 'Repost' },
  count: { type: Number, default: undefined }
})

const emit = defineEmits(['update:reposted', 'change'])

const { isReposted, toggleRepost } = usePosts()

const reposted = ref<boolean>(props.initialReposted ?? false)
const loading = ref(false)

onMounted(async () => {
  if (props.initialReposted === undefined) {
    try {
      const res = await isReposted(props.postId)
      reposted.value = !!(typeof res === 'boolean' ? res : res?.reposted)
    } catch {
      reposted.value = false
    }
  }
})

async function onClick() {
  if (loading.value) return
  loading.value = true

  try {
    const res = await toggleRepost(props.postId)
    reposted.value = !!(res?.reposted ?? res ?? !reposted.value)

    emit('update:reposted', reposted.value)
    emit('change', reposted.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.repost-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s ease, transform 0.15s ease;
  color: rgba(255, 255, 255, 0.7);
}

.repost-btn:hover {
  color: #00ba7c;
  transform: scale(1.05);
}

.repost-btn.reposted {
  color: #00ba7c;
}

.repost-icon {
  font-size: 20px;
}

.repost-label {
  font-size: 14px;
  font-weight: 500;
}

.repost-count {
  font-size: 14px;
  opacity: 0.8;
}
</style>
