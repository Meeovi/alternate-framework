<script setup lang="ts">
// Submits to layers/search's /search page.
defineProps<{ closesearch?: () => void }>()

const q = ref('')

function submit() {
  const term = q.value.trim()
  if (term) navigateTo({ path: '/search', query: { q: term } })
}
</script>

<template>
  <v-text-field
    v-model="q"
    persistent-placeholder
    placeholder="Search"
    color="primary"
    variant="outlined"
    hide-details
    @keydown.enter="submit"
  >
    <template #prepend-inner>
      <v-icon icon="fas fa-magnifying-glass" size="15" class="text-lightText SearchIcon" />
    </template>
    <template #append-inner>
      <v-btn color="lightsecondary" icon rounded="sm" variant="flat" size="small" class="text-secondary SearchSetting" @click="submit">
        <v-icon icon="fas fa-arrow-right" size="16" />
      </v-btn>
      <v-btn
        v-if="closesearch"
        color="lighterror"
        icon
        rounded="sm"
        variant="flat"
        size="small"
        class="text-error SearchSetting ml-3 d-block d-lg-none"
        @click="closesearch"
      >
        <v-icon icon="fas fa-xmark" size="16" />
      </v-btn>
    </template>
  </v-text-field>
</template>
