<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: File[]
    label?: string
    multiple?: boolean
  }>(),
  {
    modelValue: () => [],
    label: 'Upload files',
    multiple: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: File[]]
}>()

const model = computed({
  get: () => props.modelValue ?? [],
  set: (value: File[]) => emit('update:modelValue', value),
})
</script>

<template>
  <v-file-upload
    v-model="model"
    :label="label"
    :multiple="multiple"
    clearable
    v-bind="$attrs"
  />
</template>
