<template>
  <div>
    <v-tabs v-model="mediaTab" align-tabs="center">
      <v-tab value="photos">Photos</v-tab>
      <v-tab value="videos">Videos</v-tab>
      <v-tab value="audio">Audio</v-tab>
      <v-tab value="documents">Documents</v-tab>
    </v-tabs>
    <v-tabs-window v-model="mediaTab">
      <!--Photos in Space-->
      <v-tabs-window-item value="photos">
        <div v-if="space?.image">
          <v-row>
            <v-col class="d-flex child-flex" cols="4">
              <v-img :lazy-src="`${space?.image}`" :src="`${space?.image}`" :alt="space?.name" aspect-ratio="1"
                class="bg-grey-lighten-2" cover>
                <template v-slot:placeholder>
                  <v-row class="fill-height align-center justify-center">
                    <v-progress-circular color="grey-lighten-5" indeterminate></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-col>
          </v-row>
        </div>

        <div v-else class="center-text">No Photos Found in {{ space?.name }}</div>
      </v-tabs-window-item>

      <!--Videos in Space-->
      <v-tabs-window-item value="videos">
        <div v-if="space?.media && space.media.type === 'video'">
          <videoPlayer :player="space?.media" />
        </div>
        <div v-else class="center-text">No Videos Found in {{ space?.name }}</div>
      </v-tabs-window-item>

      <!--Audio in Space-->
      <v-tabs-window-item value="audio">
        <div v-if="space?.media && space.media.type === 'audio'">
          <videoPlayer :player="space?.media" />
        </div>
        <div v-else class="center-text">No Audio Found in {{ space?.name }}</div>
      </v-tabs-window-item>

      <!--Documents in Space-->
      <v-tabs-window-item value="documents">
        <div v-if="space?.media && space.media.type === 'document'">
          <v-row>
            <v-col class="d-flex child-flex" cols="4">
              <v-img :lazy-src="`${space?.file}`" :src="`${space?.file}`" :alt="space?.name" aspect-ratio="1"
                class="bg-grey-lighten-2" cover>
                <template v-slot:placeholder>
                  <v-row class="fill-height align-center justify-center">
                    <v-progress-circular color="grey-lighten-5" indeterminate></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-col>
          </v-row>
        </div>
        <div v-else class="center-text">No Documents Found in {{ space?.name }}</div>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
<script setup>
  import {
    ref
  } from 'vue'
  defineProps({
    space: Object
  })
  import videoPlayer from '#shared/app/components/blocks/videoPlayer.vue'
  
  const mediaTab = ref('photos')
</script>