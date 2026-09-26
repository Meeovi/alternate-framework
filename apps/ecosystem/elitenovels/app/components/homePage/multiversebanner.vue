<template>
  <div v-if="blogs">
    <v-toolbar title="POSTS FROM ACROSS THE MULTIVERSE" density="comfortable" color="transparent"></v-toolbar>
    <v-carousel v-for="blog in blogs" :key="blog.id">
      <v-carousel-item :src="`${blog?.image?.filename_disk}`" cover></v-carousel-item>
    </v-carousel>
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
      data: blogs
  } = useLazyAsyncData('blogs', () => {
      return $directus.request($readItems('blogs', {
            fields: ['*', { '*': ['*'] }]
        }))
  })
</script>