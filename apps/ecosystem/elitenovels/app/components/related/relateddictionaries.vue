<template>
    <div>
      <v-col cols="12">
        <v-toolbar title="OTHER DEFINITIONS" density="comfortable" color="transparent">
        </v-toolbar>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="py-4 px-sm-4" selected-class="bg-success">
            <v-slide-group-item v-for="dictionary in definition" :key="dictionary"
              v-slot="{ toggle, selectedClass }">
              <dictionary :dictionary="dictionary" :class="selectedClass" @click="toggle" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'
  import dictionary from '~/components/related/dictionary.vue'

  const model = ref(null)
  const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
        data: definition
    } = useLazyAsyncData('definition', () => {
        return $directus.request($readItems('dictionary'))
    })
</script>