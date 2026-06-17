<template>
  <JsonFormRenderer
    :schema="schema"
    :uischema="uischema"
    :model-value="modelValue"
    :submitting="submitting"
    :config="config"
    @update:model-value="emit('update:modelValue', $event)"
    @submit="emit('submit')"
    @reset="emit('reset')"
  />
</template>

<script setup lang="ts">
import JsonFormRenderer from '../../../../../../packages/modules/ui-forms/src/components/JsonFormRenderer.vue'

type ContentField = {
  field?: string
  type?: string
  name?: string
  schema?: {
    data_type?: string
    default_value?: unknown
    is_nullable?: boolean
    foreign_key_table?: string
  }
  meta?: {
    interface?: string
    note?: string
    hidden?: boolean
    required?: boolean
    readonly?: boolean
    options?: Record<string, unknown> | Array<unknown>
  }
}

const props = withDefaults(defineProps<{
  fields: ContentField[]
  modelValue: Record<string, unknown>
  uischema?: Record<string, unknown>
  submitting?: boolean
  config?: Record<string, unknown>
}>(), {
  modelValue: () => ({}),
  submitting: false,
  config: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [Record<string, unknown>]
  submit: []
  reset: []
}>()

function mapFieldType(field: ContentField) {
  const dataType = String(field.type || field.schema?.data_type || '').toLowerCase()
  const fieldInterface = String(field.meta?.interface || '').toLowerCase()

  if (fieldInterface.includes('datetime') || ['datetime', 'timestamp'].includes(dataType)) {
    return { type: 'string', format: 'date-time' }
  }

  if (fieldInterface.includes('date') || dataType === 'date') {
    return { type: 'string', format: 'date' }
  }

  if (fieldInterface.includes('time') || dataType === 'time') {
    return { type: 'string', format: 'time' }
  }

  if (fieldInterface.includes('file') || dataType === 'file') {
    return { type: 'string', format: 'file' }
  }

  if (fieldInterface.includes('rich-text') || dataType === 'text') {
    return { type: 'string', format: 'richtext' }
  }

  if (dataType === 'boolean') {
    return { type: 'boolean' }
  }

  if (['integer', 'bigint', 'float', 'decimal', 'number'].includes(dataType)) {
    return { type: 'number' }
  }

  return { type: 'string' }
}

function getFieldOptions(field: ContentField) {
  const options = field.meta?.options

  if (Array.isArray(options)) {
    return options.map((option) => (typeof option === 'string' ? option : String(option)))
  }

  if (options && typeof options === 'object' && Array.isArray((options as { choices?: unknown[] }).choices)) {
    return (options as { choices: Array<string | { text?: unknown; value?: unknown }> }).choices.map((choice) => {
      if (typeof choice === 'string') return choice
      return String(choice.text ?? choice.value ?? '')
    })
  }

  return undefined
}

const schema = computed(() => {
  const properties: Record<string, Record<string, unknown>> = {}
  const required: string[] = []

  for (const field of props.fields || []) {
    if (!field?.field || field?.meta?.hidden) continue

    const property: Record<string, unknown> = {
      ...mapFieldType(field),
      title: field.meta?.note || field.name || field.field,
    }

    const enumOptions = getFieldOptions(field)
    if (enumOptions?.length) {
      property.enum = enumOptions
    }

    if (field.schema?.foreign_key_table || field.meta?.interface?.includes('m2o')) {
      property.format = 'relation'
    }

    properties[field.field] = property

    if (field.meta?.required || !field.schema?.is_nullable) {
      if (!required.includes(field.field)) {
        required.push(field.field)
      }
    }
  }

  return {
    type: 'object',
    properties,
    required,
  }
})
</script>
