<template>
  <div class="categoryPage">
    <v-row style="background-color: sienna;">
      <v-col cols="12">
        <v-toolbar title="Popular Monsters" density="comfortable" color="transparent"></v-toolbar>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
            <v-slide-group-item v-for="monster in monsters" :key="monster.id || monster.slug || monster.name">
              <template #default="{ toggle, selectedClass }">
                <characterCard :character="monster" class="characterCard" @click="toggle" :class="selectedClass" />
              </template>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-toolbar title="Aurelian Characters" density="comfortable" color="transparent"></v-toolbar>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="py-4 px-sm-4" selected-class="bg-success">
            <v-slide-group-item v-for="item in aurelian" :key="item.id || item.slug || item.name">
              <template #default="{ toggle, selectedClass }">
                <characterCard :character="item" class="characterCard" @click="toggle" :class="selectedClass"  />
              </template>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>

      <v-col cols="12">
        <v-toolbar title="BROWSE MONSTERS" density="comfortable" color="transparent"></v-toolbar>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="monster in monsters" :key="monster.id || monster.slug || monster.name">
        <characterCard :character="monster" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  import characterCard from '~/components/related/character.vue'

  const model = ref(null);

  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const {
    data: monsters
  } = useLazyAsyncData('monsters', () => {
    return $directus.request($readItems('characters', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        type: {
          _eq: "Monster"
        }
      }
    }))
  })

  const {
    data: aurelian
  } = useLazyAsyncData('aurelian', () => {
    return $directus.request($readItems('characters', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        tags: {
          tags_id: {
            name: {
              _eq: "Aurelian Characters"
            }
          }
        }
      }
    }))
  })

  useHead({
    title: 'Monsters',
  })
</script>