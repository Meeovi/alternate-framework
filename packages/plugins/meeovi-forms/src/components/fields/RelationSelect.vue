<template>
  <v-select
    :model-value="modelValue ?? (multiple ? [] : null)"
    :items="items"
    item-title="title"
    item-value="value"
    :label="label"
    :multiple="multiple"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    class="field"
    @update:model-value="onChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface RelationSelectProps {
  label: string
  modelValue: string | number | null
  options?: any[]
  multiple?: boolean
  schema?: Record<string, any>
}

const props = withDefaults(defineProps<RelationSelectProps>(), {
  options: () => [],
  multiple: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number | null] }>()

const items = computed(() =>
  (props.options || []).map((option: any) => ({
    title: String(option?.label ?? option?.value ?? option),
    value: option?.value ?? option,
  }))
)

const onChange = (value: string | number | null) => emit('update:modelValue', value ?? null)
</script>
