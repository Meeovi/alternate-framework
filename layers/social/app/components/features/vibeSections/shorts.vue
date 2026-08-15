<template>
  <v-card class="mb-4" elevation="2">
    <template #title class="d-flex align-center">
      <v-avatar size="40" class="mr-3">
        <v-img :src="short?.creator_avatar || '/default-avatar.png'" :alt="short?.creator" />
      </v-avatar>
      <div>
        <div class="font-weight-bold">{{ short?.creator || 'Anonymous' }}</div>
        <div class="text-caption text-grey">{{ formatDate(short?.date_created) }}</div>
      </div>
      <v-spacer />
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
        </template>
        <v-list>
          <v-list-item @click="shareVibe">
            <v-list-item-title>Share Vibe</v-list-item-title>
          </v-list-item>
          <v-list-item @click="reportVibe">
            <v-list-item-title>Report</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <video 
      ref="videoRef"
      class="vibe-video"
      :src="getAssetURL(short?.video)"
      controls
      preload="metadata"
      @click="togglePlay"
    />

    <template>
      <h4 v-if="short?.name" class="mb-2">{{ short.name }}</h4>
      <p v-if="short?.description">{{ short.description }}</p>
      
      <div v-if="hashtags.length" class="mt-2">
        <v-chip
          v-for="tag in hashtags"
          :key="tag"
          size="small"
          color="primary"
          variant="outlined"
          class="mr-1 mb-1"
          @click="$emit('hashtag-click', tag)"
        >
          #{{ tag }}
        </v-chip>
      </div>
    </template>

    <template>
      <v-btn icon="mdi-heart" variant="text" @click="toggleLike" :color="isLiked ? 'red' : 'grey'" />
      <span class="text-caption">{{ likesCount }}</span>
      
      <v-btn icon="mdi-comment" variant="text" @click="toggleComments" />
      <span class="text-caption">{{ commentsCount }}</span>
      
      <v-btn icon="fas share-nodes" variant="text" @click="shareVibe" />
      <span class="text-caption">{{ short?.shares_count || 0 }}</span>
      
      <v-spacer />
      <v-btn :to="`/social/vibe/${short?.id}`" variant="text" size="small">View Vibe</v-btn>
    </template>

    <!-- Comments Section -->
    <v-expand-transition>
      <div v-show="showComments">
        <v-divider />
        <template>
          <v-text-field
            v-model="newComment"
            label="Add a comment..."
            variant="outlined"
            density="compact"
            append-inner-icon="mdi-send"
            @click:append-inner="addComment"
            @keyup.enter="addComment"
          />
          
          <div v-for="comment in vibeComments" :key="comment.id" class="mb-2">
            <div class="d-flex align-start">
              <v-avatar size="32" class="mr-2">
                <v-img :src="comment.user_avatar || '/default-avatar.png'" />
              </v-avatar>
              <div>
                <div class="font-weight-bold text-caption">{{ comment.username }}</div>
                <div class="text-body-2">{{ comment.content }}</div>
                <div class="text-caption text-grey">{{ formatDate(comment.date_created) }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from '#imports'
import { getAssetURL } from '#shared/app/utils/get-asset-url'

const { $sdk } = useNuxtApp()

const props = defineProps({
  short: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['hashtag-click', 'comment-click', 'share'])

const { short } = props
const videoRef = ref(null)
const isLiked = ref(false)
const likesCount = ref(short?.likes_count || 0)
const showComments = ref(false)
const newComment = ref('')
const vibeComments = ref([])
const commentsLoaded = ref(false)
const commentsCount = computed(() =>
  commentsLoaded.value ? vibeComments.value.length : (short?.comments_count || 0)
)

onMounted(async () => {
  try {
    const reaction = await $fetch('/api/social/reactions', {
      params: { targetType: 'shorts', targetId: short?.id },
    })
    isLiked.value = reaction.reacted
    likesCount.value = reaction.count
  } catch (error) {
    console.error('Failed to load reaction state:', error)
  }
})

const hashtags = computed(() => {
  if (!short?.description) return []
  const matches = short.description.match(/#(\w+)/g)
  return matches ? matches.map(tag => tag.slice(1)) : []
})

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const togglePlay = () => {
  if (videoRef.value) {
    if (videoRef.value.paused) {
      videoRef.value.play()
    } else {
      videoRef.value.pause()
    }
  }
}

const toggleLike = async () => {
  const wasLiked = isLiked.value
  // Optimistic update — reverted below if the request fails.
  isLiked.value = !wasLiked
  likesCount.value += wasLiked ? -1 : 1
  try {
    await $fetch('/api/social/reactions', {
      method: 'POST',
      body: { targetType: 'shorts', targetId: short?.id, emoji: '❤️' },
    })
  } catch (error) {
    isLiked.value = wasLiked
    likesCount.value += wasLiked ? 1 : -1
    console.error('Failed to toggle like:', error)
  }
}

const toggleComments = () => {
  showComments.value = !showComments.value
  if (showComments.value && vibeComments.value.length === 0) {
    loadComments()
  }
}

const addComment = async () => {
  const content = newComment.value.trim()
  if (!content) return

  try {
    const comment = await $fetch('/api/social/comments', {
      method: 'POST',
      body: { targetType: 'shorts', targetId: short?.id, content },
    })
    vibeComments.value.unshift(comment)
    newComment.value = ''
  } catch (error) {
    console.error('Failed to post comment:', error)
  }
}

const loadComments = async () => {
  try {
    const { data } = await $fetch('/api/social/comments', {
      params: { targetType: 'shorts', targetId: short?.id },
    })
    vibeComments.value = data
    commentsLoaded.value = true
  } catch (error) {
    console.error('Failed to load comments:', error)
  }
}

const shareVibe = () => {
  emit('share', short)
}

const reportVibe = () => {
  console.log('Reporting vibe:', short.id)
}
</script>

<style scoped>
.vibe-video {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  cursor: pointer;
}

.vibe-video:hover {
  opacity: 0.9;
}
</style>