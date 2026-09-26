<template>
  <div class="categoryPage">
    <v-toolbar title="Types" style="background-color: blue;"></v-toolbar>
    <v-row style="background-color: blue;">
      <v-col cols="12">
        <h4 style="color: white;">Popular Types</h4>
        <v-sheet class="mx-auto categorySheet">
          <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
            <v-slide-group-item v-for="types in monsterTypes" :key="types">
              <template #default="{ toggle, selectedClass }">
                <types :item="types" />
              </template>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="types in monsterTypes" :key="types">
        <types :item="types" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  import types from '~/components/related/facet.vue'

  const model = ref(null);

  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const {
    data: monsterTypes
  } = useLazyAsyncData('monsterTypes', () => {
    return $directus.request($readItems('options', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        category: {
          categories_id: {
            name: {
              _eq: 'Types'
            }
          }
        }
      }
    }))
  })

  useHead({
    title: 'Types',
  })
</script>