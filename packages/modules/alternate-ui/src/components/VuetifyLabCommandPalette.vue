<script setup lang="ts">
import { computed } from 'vue'

type CommandItem = any

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    search?: string
    items?: CommandItem[]
  }>(),
  {
    modelValue: false,
    search: '',
    items: () => [
      { type: 'subheader', title: 'Navigation' },
      { type: 'item', title: 'Home', value: 'home', hotkey: 'G H' },
      { type: 'item', title: 'Search', value: 'search', hotkey: 'G S' },
      { type: 'divider' },
      { type: 'subheader', title: 'Actions' },
      { type: 'item', title: 'New Post', value: 'new-post', hotkey: 'N P' },
    ],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:search': [value: string]
}>()

const isOpen = computed({
  get: () => props.modelValue ?? false,
  set: (value: boolean) => emit('update:modelValue', value),
})

const searchValue = computed({
  get: () => props.search ?? '',
  set: (value: string) => emit('update:search', value),
})
</script>

<template>
  <v-command-palette
    v-model="isOpen"
    v-model:search="searchValue"
    :items="items"
    placeholder="Type a command"
    hotkey="ctrl+shift+k"
    v-bind="$attrs"
  />
</template>
