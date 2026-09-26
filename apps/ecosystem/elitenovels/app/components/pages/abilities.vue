<template>
  <div class="categoryPage">
    <v-toolbar title="Abilities" style="background-color: blue; color: white !important;"></v-toolbar>
    <v-row style="background-color: blue;">
      <v-col cols="12">
        <h4 style="color: white !important;">Popular Abilities</h4>
        <v-sheet class="mx-auto categorySheet">
          <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
            <v-slide-group-item v-for="abilities in ability" :key="abilities">
              <template #default="{ toggle, selectedClass }">
                <Ability :facet="abilities" :class="selectedClass" @click="toggle" />
              </template>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="abilities in characterAbility" :key="abilities">
        <Ability :facet="abilities" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  import Ability from '~/components/related/facet.vue'

  const model = ref(null);

  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const {
    data: ability
  } = useLazyAsyncData('ability', () => {
    return $directus.request($readItems('abilities', {
      fields: ['*', {
        '*': ['*']
      }]
    }))
  })

  const {
    data: characterAbility
  } = useLazyAsyncData('characterAbility', () => {
    return $directus.request($readItems('options', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        category: {
          categories_id: {
            name: {
              _eq: 'Abilities'
            }
          }
        }
      }
    }))
  })

  useHead({
    title: 'Abilities',
  })
</script>