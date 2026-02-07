<template>
  <div class="search-input">
    <input
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
      @keydown.enter.prevent="onEnter"
      class="search-input-field"
    />
    <button @click="onSearch" class="search-input-button">Search</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search...' },
})
const emit = defineEmits(['update:modelValue', 'search'])

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  emit('update:modelValue', v)
}

function onEnter() {
  emit('search')
}

function onSearch() {
  emit('search')
}
</script>

<style scoped>
.search-input { display:flex; gap:8px; align-items:center }
.search-input-field { padding:8px; border:1px solid #ccc; }
.search-input-button { padding:8px 12px }
</style>
