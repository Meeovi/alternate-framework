<template>
  <div class="categoryPage">
    <v-row style="background-color: lightgreen;">
      <v-col cols="12">
        <v-toolbar title="Popular Myths" density="comfortable" color="transparent"></v-toolbar>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
            <v-slide-group-item v-for="popular in popularMyths" :key="popular">
              <template #default="{ toggle, selectedClass }">
                <characters :character="popular" class="characterCard" @click="toggle"
                  :class="selectedClass" />
              </template>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-toolbar title="Royal Circa" density="comfortable" color="transparent"></v-toolbar>
        <v-sheet class="mx-auto">
            <v-slide-group v-model="model" class="py-4 px-sm-4" selected-class="bg-success">
              <v-slide-group-item v-for="royal in royalcirca" :key="royal">
                <template #default="{ toggle, selectedClass }">
                  <characters :character="royal" class="characterCard" @click="toggle"
                    :class="selectedClass" />
                </template>
              </v-slide-group-item>
            </v-slide-group>
        </v-sheet>
      </v-col>

      <v-col cols="12">
        <v-toolbar title="BROWSE ELITEVERSE MYTHOLOGY" density="comfortable" color="transparent"></v-toolbar>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="mythology in mythology" :key="mythology">
        <characters :character="mythology" class="characterCard" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  import characters from '~/components/related/character.vue'

  const model = ref(null);

  const {
    $directus,
    $readItems,
    $readItem
  } = useNuxtApp()

  const {
    data: popularMyths
  } = useLazyAsyncData('popularMyths', () => {
    return $directus.request($readItems('characters', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        type: {
          _eq: "Mythology"
        }
      }
    }))
  })

  const {
    data: royalcirca
  } = useLazyAsyncData('royalcirca', () => {
    return $directus.request($readItems('characters', {
      filter: {
        tags: {
          tags_id: {
            name: {
              _eq: "Royal Circa"
            }
          }
        }
      }
    }))
  })

  const {
    data: mythology
  } = useLazyAsyncData('mythology', () => {
    return $directus.request($readItems('characters', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        categories: {
          categories_id: {
            name: {
              _eq: "Mythology"
            }
          }
        }
      }
    }))
  })

  useHead({
    title: 'Mythology',
  })
</script>