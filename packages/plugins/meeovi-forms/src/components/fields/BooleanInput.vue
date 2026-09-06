<template>
  <div class="boolean-field">
    <v-checkbox
      :model-value="Boolean(modelValue)"
      :label="label"
      density="comfortable"
      hide-details="auto"
      @update:model-value="onChange"
    />
  </div>
</template>

<script setup lang="ts">
export interface BooleanInputProps {
  label: string
  modelValue: boolean | null
  schema?: Record<string, any>
}

defineProps<BooleanInputProps>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const onChange = (value: boolean | null) => emit('update:modelValue', Boolean(value))
</script>

<style scoped>
/* v-checkbox has no outlined variant of its own — a plain border on the
   wrapper keeps it visually consistent with the outlined text/select
   fields around it. */
.boolean-field {
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  padding: 0 0.75rem;
}
</style>
