<template>
  <component
    :is="componentRef"
    :label="fieldLabel"
    :model-value="modelValue"
    :schema="inputSchema"
    @update:model-value="onUpdate"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TextField from '../../../../../../packages/modules/ui-forms/src/components/fields/TextField.vue'
import NumberField from '../../../../../../packages/modules/ui-forms/src/components/fields/NumberField.vue'
import SelectField from '../../../../../../packages/modules/ui-forms/src/components/fields/SelectField.vue'
import DateField from '../../../../../../packages/modules/ui-forms/src/components/fields/DateField.vue'
import RichTextField from '../../../../../../packages/modules/ui-forms/src/components/fields/RichTextField.vue'
import FileUploadField from '../../../../../../packages/modules/ui-forms/src/components/fields/FileUploadField.vue'
import RelationSelect from './RelationSelect.vue'

type ContentFieldSchema = {
  data_type?: string
  default_value?: unknown
  is_nullable?: boolean
  foreign_key_table?: string
}

type ContentFieldMeta = {
  interface?: string
  note?: string
  width?: string
  hidden?: boolean
  required?: boolean
  options?: Record<string, unknown>
}

type ContentField = {
  field?: string
  type?: string
  name?: string
  schema?: ContentFieldSchema
  meta?: ContentFieldMeta
}

const props = defineProps<{
  field: ContentField
  modelValue?: unknown
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const fieldName = computed(() => String(props.field.field || 'value'))
const fieldLabel = computed(() => String(props.field.meta?.note || props.field.name || fieldName.value))
const fieldWidth = computed(() => props.field.meta?.width || null)
const required = computed(() => {
  if (typeof props.field.meta?.required === 'boolean') return props.field.meta.required
  return !Boolean(props.field.schema?.is_nullable)
})

const fieldInterface = computed(() => String(props.field.meta?.interface || '').toLowerCase())
const dataType = computed(() => String(props.field.type || props.field.schema?.data_type || '').toLowerCase())

const relationCollection = computed(() => props.field.schema?.foreign_key_table || '')
const relationMultiple = computed(() => fieldInterface.value.includes('many'))

const inputSchema = computed(() => {
  const schema: Record<string, unknown> = {
    type: dataType.value || 'string',
  }

  const choices = (props.field.meta?.options as any)?.choices
  if (Array.isArray(choices) && choices.length) {
    schema.enum = choices.map((choice: any) => {
      if (typeof choice === 'object') return choice.value ?? choice.key ?? choice.name
      return choice
    })
  }

  return schema
})

const componentRef = computed(() => {
  if (fieldInterface.value.includes('file') || fieldName.value === 'file' || fieldName.value.includes('image')) {
    return FileUploadField
  }

  if (fieldInterface.value.includes('select-dropdown') || fieldInterface.value.includes('select-radio')) {
    return SelectField
  }

  if (fieldInterface.value.includes('select-multiple') || fieldInterface.value.includes('tags')) {
    return SelectField
  }

  if (fieldInterface.value.includes('m2o') || fieldInterface.value.includes('m2m') || relationCollection.value) {
    return RelationSelect
  }

  if (fieldInterface.value.includes('input-rich-text') || dataType.value === 'text') {
    return RichTextField
  }

  if (dataType.value === 'boolean') {
    return SelectField
  }

  if (['datetime', 'timestamp', 'date', 'time'].includes(dataType.value) || fieldInterface.value.includes('datetime')) {
    return DateField
  }

  if (dataType.value === 'json') {
    return RichTextField
  }

  if (['integer', 'bigint', 'float', 'decimal', 'number'].includes(dataType.value)) {
    return NumberField
  }

  return TextField
})

function onUpdate(value: unknown) {
  emit('update:modelValue', value)
}
</script>
