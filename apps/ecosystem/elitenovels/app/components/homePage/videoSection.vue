<template>
  <div>
    <v-col cols="12" v-if="videos?.length">
      <v-toolbar title="LATEST VIDEOS FROM ELITE NOVELS" density="comfortable" color="transparent"></v-toolbar>
      <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="py-4 px-sm-4" selected-class="bg-success">
            <v-slide-group-item v-for="videos in videos" :key="videos">
              <template #default="{ toggle, selectedClass }">
                <video :video="videos" />
              </template>
            </v-slide-group-item>
          </v-slide-group>
      </v-sheet>
    </v-col>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

const model = ref(null)
const {
      $directus,
      $readItems
  } = useNuxtApp()

  const {
      data: videos
  } = useLazyAsyncData('videos', () => {
      return $directus.request($readItems('videos', {
            fields: ['*', { '*': ['*'] }]
        }))
  })
</script>