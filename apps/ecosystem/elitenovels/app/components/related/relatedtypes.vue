<template>
    <div>
      <v-col cols="12">
        <v-toolbar title="OTHER TYPES" density="comfortable" color="transparent">
        </v-toolbar>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="py-4 px-sm-4" selected-class="bg-success">
            <v-slide-group-item v-for="facetItem in typesOnly" :key="facetItem.id || facetItem.name"
              v-slot="{ toggle, selectedClass }">
              <facetCard :facet="facetItem" :class="selectedClass" @click="toggle" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </div>
  </template>

  <script setup>
  import { ref, computed } from 'vue'
  import facetCard from '~/components/related/facet.vue'

  const model = ref(null)
  const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
        data: facets
    } = useLazyAsyncData('facets', () => {
        return $directus.request($readItems('options'))
    })

    // Client-side filter: only options whose `type` contains 'Types' (trim whitespace)
    const typesOnly = computed(() => {
      // Support response shapes:
      // - facets.value.data.options -> GraphQL-like { data: { options: [...] } }
      // - facets.value.data -> REST-like { data: [...] }
      // - facets.value -> already an array
      const raw = facets?.value
      let list = []
      if (raw?.data?.options && Array.isArray(raw.data.options)) list = raw.data.options
      else if (Array.isArray(raw?.data)) list = raw.data
      else if (Array.isArray(raw)) list = raw

      return list.filter(item => {
        const t = item?.type
        if (!t) return false
        if (typeof t === 'string') return t.trim() === 'Type'
        if (Array.isArray(t)) return t.some(x => (x || '').toString().trim() === 'Type')
        return false
      })
    })
</script>