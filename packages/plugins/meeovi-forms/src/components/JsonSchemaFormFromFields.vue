<template>
  <v-form @submit.prevent="submitForm">
    <DynamicFormElement
      v-for="field in visibleFields"
      :key="String(field.field || field.name || '')"
      :field="field"
      :model-value="model[String(field.field || '')]"
      @update:model-value="(value) => updateField(String(field.field || ''), value)"
    />
    <v-btn type="submit" :loading="submitting">{{ submitLabel }}</v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useJsonForm } from '@mframework/meeovi-forms'
import DynamicFormElement from './DirectusFormElement.vue'

const props = withDefaults(defineProps<{
  fields?: any[]
  modelValue?: Record<string, unknown>
  submitLabel?: string
  clearOnSuccess?: boolean
}>(), {
  modelValue: () => ({}),
  fields: () => [],
  submitLabel: 'Save',
  clearOnSuccess: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submitted: [value: unknown]
  error: [value: unknown]
}>()

const visibleFields = computed(() => {
  return (props.fields || []).filter((field: any) => !field?.meta?.hidden)
})

const formSchema = computed(() => {
  const properties: Record<string, unknown> = {}
  const required: string[] = []

  for (const field of visibleFields.value) {
    const key = String(field.field || '')
    if (!key) continue
    properties[key] = { type: 'string', title: field.meta?.note || field.name || field.field }
    if (field.meta?.required || !field.schema?.is_nullable) {
      required.push(key)
    }
  }

  return {
    type: 'object',
    properties,
    required,
  }
})

const form = useJsonForm({
  schema: formSchema.value,
  initialValue: props.modelValue || {},
})

watch(
  () => props.modelValue,
  (value) => {
    const next = value || {}
    for (const key of Object.keys(form.model)) {
      if (!(key in next)) {
        delete (form.model as Record<string, unknown>)[key]
      }
    }
    for (const [key, val] of Object.entries(next)) {
      ;(form.model as Record<string, unknown>)[key] = val
    }
  },
  { deep: true },
)

function emitModel() {
  emit('update:modelValue', { ...form.model })
}

function updateField(key: string, value: unknown) {
  form.setValue(key, value)
  emitModel()
}

const submitting = ref(false)

async function submitForm() {
  submitting.value = true
  try {
    const validation = form.validate()
    if (!validation.valid) {
      emit('error', validation.issues[0]?.message || 'Invalid form values.')
      return
    }
    emit('submitted', { ...form.model })
    if (props.clearOnSuccess) {
      form.reset()
      emitModel()
    }
  } finally {
    submitting.value = false
  }
}
</script>
