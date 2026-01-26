<template>
  <v-card class="media-player">
    <div v-if="currentMedia">
      <!-- Video Player -->
      <video
        v-if="currentMedia.media_type === 'video'"
        ref="videoPlayer"
        :src="currentMedia.url"
        :poster="currentMedia.thumbnail"
        controls
        @loadedmetadata="onMediaLoaded"
        @timeupdate="onTimeUpdate"
        @ended="onMediaEnded"
        class="w-100"
      />
      
      <!-- Audio Player -->
      <div v-else-if="currentMedia.media_type === 'audio'" class="audio-player">
        <div class="d-flex align-center pa-4">
          <v-img
            :src="currentMedia.thumbnail || '/default-audio.png'"
            width="80"
            height="80"
            class="rounded me-4"
          />
          <div class="grow">
            <h3 class="text-h6">{{ currentMedia.title }}</h3>
            <p class="text-body-2 text-medium-emphasis">
              {{ currentMedia.metadata?.artist || 'Unknown Artist' }}
            </p>
          </div>
        </div>
        
        <audio
          ref="audioPlayer"
          :src="currentMedia.url"
          @loadedmetadata="onMediaLoaded"
          @timeupdate="onTimeUpdate"
          @ended="onMediaEnded"
          style="display: none;"
        />
      </div>
    </div>

    <!-- Controls -->
    <v-card-actions class="px-4 py-2">
      <v-btn
        icon
        @click="previousTrack"
        :disabled="currentIndex === 0"
      >
        <v-icon>mdi-skip-previous</v-icon>
      </v-btn>
      
      <v-btn
        icon
        @click="togglePlayPause"
        color="primary"
        size="large"
      >
        <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
      </v-btn>
      
      <v-btn
        icon
        @click="nextTrack"
        :disabled="currentIndex === playlist.length - 1"
      >
        <v-icon>mdi-skip-next</v-icon>
      </v-btn>
      
      <v-spacer />
      
      <span class="text-caption">{{ formatTime(currentTime) }}</span>
      <v-slider
        v-model="currentTime"
        :max="duration"
        @update:model-value="seekTo"
        class="mx-4"
        style="min-width: 200px;"
        hide-details
      />
      <span class="text-caption">{{ formatTime(duration) }}</span>
      
      <v-spacer />
      
      <v-btn
        icon
        @click="toggleShuffle"
        :color="shuffle ? 'primary' : 'default'"
      >
        <v-icon>mdi-shuffle</v-icon>
      </v-btn>
      
      <v-btn
        icon
        @click="toggleRepeat"
        :color="repeat !== 'none' ? 'primary' : 'default'"
      >
        <v-icon>{{ repeatIcon }}</v-icon>
      </v-btn>
      
      <v-btn icon @click="showPlaylist = !showPlaylist">
        <v-icon>mdi-playlist-music</v-icon>
      </v-btn>
    </v-card-actions>

    <!-- Playlist -->
    <v-expand-transition>
      <div v-show="showPlaylist">
        <v-divider />
        <v-list class="playlist-list" max-height="300" style="overflow-y: auto;">
          <v-list-item
            v-for="(item, index) in playlist"
            :key="item.id"
            @click="playTrack(index)"
            :active="index === currentIndex"
          >
            <template v-slot:prepend>
              <v-img
                :src="item.thumbnail || '/default-audio.png'"
                width="40"
                height="40"
                class="rounded me-3"
              />
            </template>
            
            <v-list-item-title>{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ item.metadata?.artist || 'Unknown Artist' }}
            </v-list-item-subtitle>
            
            <template v-slot:append>
              <span class="text-caption">{{ formatTime(item.duration) }}</span>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
const props = defineProps({
  playlist: {
    type: Array,
    required: true
  },
  autoplay: {
    type: Boolean,
    default: false
  }
})

const currentIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const shuffle = ref(false)
const repeat = ref('none') // 'none', 'one', 'all'
const showPlaylist = ref(false)

const videoPlayer = ref(null)
const audioPlayer = ref(null)

const currentMedia = computed(() => {
  return props.playlist[currentIndex.value] || null
})

const currentPlayer = computed(() => {
  return currentMedia.value?.media_type === 'video' ? videoPlayer.value : audioPlayer.value
})

const repeatIcon = computed(() => {
  switch (repeat.value) {
    case 'one': return 'mdi-repeat-once'
    case 'all': return 'mdi-repeat'
    default: return 'mdi-repeat-off'
  }
})

const togglePlayPause = () => {
  if (!currentPlayer.value) return
  
  if (isPlaying.value) {
    currentPlayer.value.pause()
  } else {
    currentPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const playTrack = (index) => {
  currentIndex.value = index
  nextTick(() => {
    if (currentPlayer.value) {
      currentPlayer.value.play()
      isPlaying.value = true
    }
  })
}

const nextTrack = () => {
  if (shuffle.value) {
    currentIndex.value = Math.floor(Math.random() * props.playlist.length)
  } else if (currentIndex.value < props.playlist.length - 1) {
    currentIndex.value++
  } else if (repeat.value === 'all') {
    currentIndex.value = 0
  }
  
  nextTick(() => {
    if (currentPlayer.value && isPlaying.value) {
      currentPlayer.value.play()
    }
  })
}

const previousTrack = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else if (repeat.value === 'all') {
    currentIndex.value = props.playlist.length - 1
  }
  
  nextTick(() => {
    if (currentPlayer.value && isPlaying.value) {
      currentPlayer.value.play()
    }
  })
}

const seekTo = (time) => {
  if (currentPlayer.value) {
    currentPlayer.value.currentTime = time
  }
}

const toggleShuffle = () => {
  shuffle.value = !shuffle.value
}

const toggleRepeat = () => {
  const modes = ['none', 'all', 'one']
  const currentIndex = modes.indexOf(repeat.value)
  repeat.value = modes[(currentIndex + 1) % modes.length]
}

const onMediaLoaded = () => {
  if (currentPlayer.value) {
    duration.value = currentPlayer.value.duration || 0
  }
}

const onTimeUpdate = () => {
  if (currentPlayer.value) {
    currentTime.value = currentPlayer.value.currentTime || 0
  }
}

const onMediaEnded = () => {
  isPlaying.value = false
  
  if (repeat.value === 'one') {
    currentPlayer.value.currentTime = 0
    currentPlayer.value.play()
    isPlaying.value = true
  } else {
    nextTrack()
  }
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  if (props.autoplay && currentMedia.value) {
    nextTick(() => {
      togglePlayPause()
    })
  }
})
</script>

<style scoped>
.media-player {
  max-width: 100%;
}

.audio-player {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.playlist-list {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>