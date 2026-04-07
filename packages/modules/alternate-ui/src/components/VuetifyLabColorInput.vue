<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
  }>(),
  {
    modelValue: '#1f88d6',
    label: 'Pick a color',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const model = computed({
  get: () => props.modelValue ?? '#1f88d6',
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <v-color-input
    color-pip
    v-model="model"
    :label="label"
    hide-details
    clearable
    v-bind="$attrs"
  />
</template>
