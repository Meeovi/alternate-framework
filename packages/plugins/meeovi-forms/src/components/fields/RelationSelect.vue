<template>
  <label class="field">
    <span>{{ label }}</span>
    <select :value="modelValue ?? ''" @change="onChange" :multiple="multiple">
      <option v-for="option in safeOptions" :key="String(option.value ?? option)" :value="String(option.value ?? option)">
        {{ option.label ?? option.value ?? option }}
      </option>
    </select>
  </label>
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

const safeOptions = computed(() => props.options || [])

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value || null)
}
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
</style>
