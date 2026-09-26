<template>
  <div class="categoryPage">
    <v-toolbar title="Dictionary" style="background-color: lightcoral"></v-toolbar>

    <v-row style="padding: 10px;">
      <v-col cols="auto" v-for="definition in dictionaryData" :key="definition.id">
        <Dictionary :dictionary="definition" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  //import characterbar from '~/components/menus/characterbar.vue'
  import Dictionary from '~/components/related/dictionary.vue'
  const model = ref(null);

  const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
        data: dictionaryData
    } = useLazyAsyncData('dictionary', () => {
        return $directus.request($readItems('options', {
            fields: ['*', { '*': ['*'] }],
            filter: {
              category: {
                categories_id: {
                  name: {
                    _eq: 'Dictionary'
                  }
                }
              }
            }
        }))
    })

  useHead({
    title: 'Dictionary',
  })
</script>