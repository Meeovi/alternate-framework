<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600">
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title>Search in {{ space?.name || 'Space' }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="$emit('update:modelValue', false)"><i class="fas fa-times"></i></v-btn>
      </v-toolbar>
      <v-card-text>
        <v-text-field v-model="searchQuery" label="Search for..." prepend-inner-icon="fas fa-search"
          @keyup.enter="submitSearch" autofocus />
        <v-select v-model="searchType" :items="searchTypes" label="Type" class="mt-4" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="submitSearch">
          <i class="fas fa-search"></i> Search
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import {
    ref,
    watch
  } from 'vue'
  const props = defineProps({
    modelValue: Boolean,
    space: Object
  })
  const emit = defineEmits(['update:modelValue', 'search'])
  const searchQuery = ref('')
  const searchType = ref('All')
  const searchTypes = [
    'All',
    'Posts',
    'Members',
    'Media',
    'Products',
    'Lists',
    'Documents'
  ]

  function submitSearch() {
    emit('search', {
      query: searchQuery.value,
      type: searchType.value
    })
    emit('update:modelValue', false)
  }
  watch(() => props.modelValue, (val) => {
    if (!val) searchQuery.value = ''
  })
</script>