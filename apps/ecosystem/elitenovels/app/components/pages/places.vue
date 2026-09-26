<template>
  <div class="categoryPage">
    <v-toolbar title="Places" style="background-color: khaki;"></v-toolbar>
    <v-row style="background-color: khaki;">
      <v-col cols="12">
        <h4 style="color: black;">Popular Places</h4>
        <v-sheet class="mx-auto categorySheet">
          <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
            <v-slide-group-item v-for="places in characterPlaces" :key="places?.id"
              v-slot="{ toggle, selectedClass }">
              <Places :facet="places" :class="selectedClass" @click="toggle" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="places in characterPlaces" :key="places.id">
        <Places :facet="places" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Places from '~/components/related/facet.vue'

const model = ref(null)
const { $directus, $readItems } = useNuxtApp()

const { data: characterPlaces } = useLazyAsyncData('characterPlaces', async () => {
  return await $directus.request(
    $readItems('options', {
      fields: ['*', 'category.categories_id.*'],
      filter: {
        category: {
          categories_id: {
            name: { _eq: 'Places' },
          },
        },
      },
    })
  )
})

useHead({
  title: 'Places',
})
</script>