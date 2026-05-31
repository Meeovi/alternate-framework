<template>
  <div>
    <v-tabs v-model="mediaTab" align-tabs="center">
      <v-tab value="photos">Photos</v-tab>
      <v-tab value="videos">Videos</v-tab>
      <v-tab value="audio">Audio</v-tab>
      <v-tab value="documents">Documents</v-tab>
    </v-tabs>
    <v-tabs-window v-model="mediaTab">
      <v-tabs-window-item value="photos">
        <div v-if="space?.image">
          <photoCard :media="space?.image" />
        </div>
        <div v-else class="center-text">No Photos Found in {{ space?.name }}</div>
      </v-tabs-window-item>
      <v-tabs-window-item value="videos">
        <div v-if="space?.media && space.media.type === 'video'">
          <videoCard :media="space?.media" />
        </div>
        <div v-else class="center-text">No Videos Found in {{ space?.name }}</div>
      </v-tabs-window-item>
      <v-tabs-window-item value="audio">
        <div v-if="space?.media && space.media.type === 'audio'">
          <!-- Add your audio player here -->
        </div>
        <div v-else class="center-text">No Audio Found in {{ space?.name }}</div>
      </v-tabs-window-item>
      <v-tabs-window-item value="documents">
        <div v-if="space?.media && space.media.type === 'document'">
          <!-- Add your document viewer here -->
        </div>
        <div v-else class="center-text">No Documents Found in {{ space?.name }}</div>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
<script setup>
import { ref } from 'vue'
defineProps({ space: Object })
import photoCard from '#shared/app/components/media/imageCard.vue'
import videoCard from '#shared/app/components/media/mediaCard.vue'
const mediaTab = ref('photos')
</script>
