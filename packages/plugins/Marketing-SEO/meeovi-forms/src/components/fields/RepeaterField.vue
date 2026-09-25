<template>
  <div class="repeater-field">
    <div v-for="(item, index) in modelValue" :key="index" class="repeater-item">
      <div class="repeater-item-header">
        <span class="repeater-item-label">{{ label }} {{ index + 1 }}</span>
        <button type="button" class="repeater-remove" @click="remove(index)" :disabled="disabled">
          Remove
        </button>
      </div>
      <div class="repeater-item-content">
        <slot :item="item" :index="index" :update="updateItem">
          <v-text-field
            :model-value="item"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            :disabled="disabled"
            @update:model-value="(value) => updateItem(index, value)"
          />
        </slot>
      </div>
    </div>
    <button type="button" class="repeater-add" @click="add" :disabled="disabled">
      + Add {{ label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export interface RepeaterFieldProps {
  label: string
  modelValue: string[]
  disabled?: boolean
}

const props = defineProps<RepeaterFieldProps>()
const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const add = () => {
  emit('update:modelValue', [...(props.modelValue ?? []), ''])
}

const remove = (index: number) => {
  const next = [...(props.modelValue ?? [])]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

const updateItem = (index: number, value: string) => {
  const next = [...(props.modelValue ?? [])]
  next[index] = value
  emit('update:modelValue', next)
}
</script>

<style scoped>
.repeater-field {
  display: grid;
  gap: 0.75rem;
}
.repeater-item {
  display: grid;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.repeater-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.repeater-item-label {
  font-weight: 500;
  font-size: 0.875rem;
}
.repeater-remove {
  font-size: 0.75rem;
  color: #b00020;
  background: transparent;
  border: 1px solid #b00020;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}
.repeater-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.repeater-add {
  font-size: 0.875rem;
  color: #1976d2;
  background: transparent;
  border: 1px dashed #1976d2;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
}
.repeater-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
