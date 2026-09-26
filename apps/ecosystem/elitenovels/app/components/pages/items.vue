<template>
  <div class="categoryPage">
    <v-toolbar title="Items" style="background-color: khaki;"></v-toolbar>
    <v-row style="background-color: khaki;">
      <v-col cols="12">
        <h4 style="color: black;">Popular Items</h4>
        <v-sheet class="mx-auto categorySheet">
          <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
            <v-slide-group-item v-for="items in characterItems" :key="items?.id"
              v-slot="{ toggle, selectedClass }">
              <Items :facet="items" :class="selectedClass" @click="toggle" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="items in characterItems" :key="items.id">
        <Items :facet="items" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  import Items from '~/components/related/facet.vue'

  const model = ref(null)
  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const {
    data: characterItems
  } = useLazyAsyncData('characterItems', async () => {
    return await $directus.request(
      $readItems('options', {
        fields: ['*', 'category.categories_id.*'],
        filter: {
          category: {
            categories_id: {
              name: {
                _eq: 'Items'
              },
            },
          },
        },
      })
    )
  })

  useHead({
    title: 'Items',
  })
</script>