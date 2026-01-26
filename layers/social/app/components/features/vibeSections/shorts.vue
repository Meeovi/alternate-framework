<template>
  <v-card class="mb-4" elevation="2">
    <v-card-title class="d-flex align-center">
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
    </v-card-title>

    <video 
      ref="videoRef"
      class="vibe-video"
      :src="`${$directus.url}/assets/${short?.video?.filename_disk}`"
      controls
      preload="metadata"
      @click="togglePlay"
    />

    <v-card-text>
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
    </v-card-text>

    <v-card-actions>
      <v-btn icon="mdi-heart" variant="text" @click="toggleLike" :color="isLiked ? 'red' : 'grey'" />
      <span class="text-caption">{{ short?.likes_count || 0 }}</span>
      
      <v-btn icon="mdi-comment" variant="text" @click="toggleComments" />
      <span class="text-caption">{{ short?.comments_count || 0 }}</span>
      
      <v-btn icon="fas:fa:fa share-nodes" variant="text" @click="shareVibe" />
      <span class="text-caption">{{ short?.shares_count || 0 }}</span>
      
      <v-spacer />
      <v-btn :to="`/social/vibe/${short?.id}`" variant="text" size="small">View Vibe</v-btn>
    </v-card-actions>

    <!-- Comments Section -->
    <v-expand-transition>
      <div v-show="showComments">
        <v-divider />
        <v-card-text>
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
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
const showComments = ref(false)
const newComment = ref('')
const vibeComments = ref([])

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
  isLiked.value = !isLiked.value
  // TODO: Implement like functionality with Directus
}

const toggleComments = () => {
  showComments.value = !showComments.value
  if (showComments.value && vibeComments.value.length === 0) {
    loadComments()
  }
}

const addComment = async () => {
  if (!newComment.value.trim()) return
  
  // TODO: Implement comment creation with Directus
  const comment = {
    id: Date.now(),
    username: 'Current User',
    content: newComment.value,
    date_created: new Date().toISOString()
  }
  
  vibeComments.value.unshift(comment)
  newComment.value = ''
}

const loadComments = async () => {
  // TODO: Load comments from Directus
  vibeComments.value = [
    {
      id: 1,
      username: 'User1',
      content: 'Great vibe!',
      date_created: new Date().toISOString()
    }
  ]
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
