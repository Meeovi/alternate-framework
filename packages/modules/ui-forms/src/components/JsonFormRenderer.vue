<template>
  <form class="ui-forms-renderer" @submit.prevent="onSubmitInternal">
    <SectionLayout>
      <div v-for="(fieldSchema, key) in properties" :key="key" class="ui-forms-field">
        <component
          :is="resolveComponent(fieldSchema)"
          :label="fieldSchema.title || key"
          :model-value="modelValue[key]"
          :schema="fieldSchema"
          @update:model-value="updateField(key, $event)"
        />
      </div>
    </SectionLayout>

    <div class="ui-forms-controls">
      <SubmitButton :disabled="submitting">Submit</SubmitButton>
      <ResetButton @click="onReset">Reset</ResetButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SectionLayout from './layouts/SectionLayout.vue'
import SubmitButton from './controls/SubmitButton.vue'
import ResetButton from './controls/ResetButton.vue'
import TextField from './fields/TextField.vue'
import NumberField from './fields/NumberField.vue'
import SelectField from './fields/SelectField.vue'
import DateField from './fields/DateField.vue'
import RichTextField from './fields/RichTextField.vue'
import FileUploadField from './fields/FileUploadField.vue'

const props = withDefaults(defineProps<{
  schema: Record<string, any>
  modelValue: Record<string, any>
  submitting?: boolean
}>(), {
  submitting: false,
})

const emit = defineEmits<{
  'update:modelValue': [Record<string, any>]
  submit: []
  reset: []
}>()

const properties = computed(() => props.schema?.properties || {})

const resolveComponent = (fieldSchema: Record<string, any>) => {
  if (fieldSchema?.format === 'richtext') return RichTextField
  if (fieldSchema?.format === 'file') return FileUploadField
  if (fieldSchema?.format === 'date') return DateField
  if (fieldSchema?.enum) return SelectField
  if (fieldSchema?.type === 'number' || fieldSchema?.type === 'integer') return NumberField
  return TextField
}

const updateField = (key: string, value: unknown) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}

const onSubmitInternal = () => emit('submit')
const onReset = () => emit('reset')
</script>

<style scoped>
.ui-forms-renderer { display: grid; gap: 1rem; }
.ui-forms-field { display: grid; gap: 0.5rem; }
.ui-forms-controls { display: flex; gap: 0.75rem; }
</style>
