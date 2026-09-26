<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="categories in categories" :key="categories">
        <v-card class="mx-auto" max-width="300">
          <img class="align-end text-white" height="350" :src="`${categories?.image.filename_disk}`" cover />

          <v-card-subtitle class="pt-4">
            {{ categories?.name }}
          </v-card-subtitle>

          <v-card-title>{{ categories?.name }}</v-card-title>

          <v-card-actions>
            <v-btn color="blue" variant="outlined" :href="`/categories/${categories?.name}`">
              Explore
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
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
      data: categories
  } = useLazyAsyncData('categories', () => {
      return $directus.request($readItems('categories', {
            fields: ['*', { '*': ['*'] }]
        }))
  })
</script>