<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | Date | null
    label?: string
  }>(),
  {
    modelValue: null,
    label: 'Choose a date',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | Date | null]
}>()

const model = computed({
  get: () => props.modelValue ?? null,
  set: (value: string | Date | null) => emit('update:modelValue', value),
})
</script>

<template>
  <v-date-input
    v-model="model"
    :label="label"
    clearable
    hide-details
    v-bind="$attrs"
  />
</template>
