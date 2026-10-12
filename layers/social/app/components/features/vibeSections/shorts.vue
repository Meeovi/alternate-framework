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
          <v-btn icon="fas fa-ellipsis-vertical" variant="text" v-bind="props" />
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

    <MeeoviPlayer
      class="vibe-video"
      :src="getAssetURL(short?.video_url || short?.video)"
      :poster="getAssetURL(short?.thumbnail_url || short?.thumbnail)"
      :title="short?.name"
    />

    <v-card-text>
      <h4 v-if="short?.name" class="mb-2">{{ short?.name }}</h4>
      <p v-if="short?.description">{{ short?.description }}</p>
      
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
      <MeeoviRating type="shorts" :id="short?.id" summary />

      <v-btn icon="fas fa-comment" variant="text" @click="toggleComments" />
      <span class="text-caption">{{ short?.comments_count || 0 }}</span>
      
      <v-btn icon="fas fa-share-nodes" variant="text" @click="shareVibe" />
      <span class="text-caption">{{ short?.shares_count || 0 }}</span>
      
      <v-spacer />
      <v-btn :to="`/connect/vibe/${short?.id}`" variant="text" size="small">View Vibe</v-btn>
    </v-card-actions>

    <!-- The vibe's live discussion (@mframework/meeovi-discussions). Mounted
         only once opened, so a feed doesn't load one chat per card. -->
    <v-expand-transition>
      <div v-if="showComments">
        <v-divider />
        <MeeoviDiscussion v-if="short?.id" type="vibe" :id="short.id" :title="short?.name" height="420px" />
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, computed } from '#imports'
import { getAssetURL } from '#shared/app/utils/get-asset-url'

const { short } = defineProps({
  short: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['hashtag-click', 'comment-click', 'share'])

const showComments = ref(false)

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

const toggleComments = () => {
  showComments.value = !showComments.value
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