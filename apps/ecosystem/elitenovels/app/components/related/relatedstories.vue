<template>
    <div>
      <v-col cols="12">
        <v-toolbar title="READ STORIES ABOUT YOUR FAVORITE CHARACTERS" density="comfortable" color="transparent">
        </v-toolbar>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="py-4 px-sm-4" selected-class="bg-success">
            <v-slide-group-item v-for="(item, index) in stories" :key="item?.id || item?.slug || index">
              <template #default="{ toggle, selectedClass }">
                <div @click="toggle" :class="selectedClass">
                  <story :story="item" />
                </div>
              </template>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'
  import story from '~/components/related/story.vue'

  const model = ref(null)
  const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
        data: stories
    } = useLazyAsyncData('stories', () => {
        return $directus.request($readItems('stories'))
    })
</script>