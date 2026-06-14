<template>
  <div>
    <div v-if="loading">Loading form schema...</div>
    <div v-else-if="schemaError" class="dynamic-form-error">{{ schemaError }}</div>
    <div v-else-if="submitError" class="dynamic-form-error">{{ submitError }}</div>
    <v-form v-else @submit.prevent="submitForm">
      <DynamicFormElement
        v-for="field in visibleFields"
        :key="String(field.field || field.name || '')"
        :field="field"
        :model-value="form.model[String(field.field || '')]"
        @update:model-value="(value) => updateField(String(field.field || ''), value)"
      />
      <NuxtTurnstile
        v-if="turnstileEnabled"
        ref="turnstile"
        v-model="turnstileToken"
      />
      <v-btn type="submit" :loading="submitting">{{ submitLabel }}</v-btn>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useJsonForm } from '../../../../../../packages/modules/ui-forms/src/composables/useJsonForm'
import DynamicFormElement from './DynamicFormElement.vue'
import useDynamicSchema, { type DynamicContentField } from '../../../composables/content/useDynamicSchema'
import useSSF from '../../../composables/security/ssf'

// Usage examples from parent components:
// <DynamicForm :enable-turnstile="true" ... />  // Force Turnstile on
// <DynamicForm :enable-turnstile="false" ... /> // Force Turnstile off
// <DynamicForm ... />                            // Use global Turnstile config

const props = withDefaults(defineProps<{
  collection: string
  modelValue?: Record<string, unknown>
  fields?: DynamicContentField[]
  submitLabel?: string
  clearOnSuccess?: boolean
  enableTurnstile?: boolean | null
}>(), {
  modelValue: () => ({}),
  fields: () => [],
  submitLabel: 'Save',
  clearOnSuccess: false,
  enableTurnstile: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submitted: [value: unknown]
  error: [value: unknown]
}>()

const { $directus, $createItem } = useNuxtApp()
const { fields: schemaFields, loading, error: schemaError, loadSchema: loadSchemaForCollection } = useDynamicSchema()

const submitting = ref(false)
const submitError = ref<string | null>(null)
const turnstile = ref<{ reset?: () => void } | null>(null)
const turnstileToken = ref('')
const { flags } = useSSF()
const turnstileEnabled = computed(() => {
  if (typeof props.enableTurnstile === 'boolean') {
    return props.enableTurnstile
  }
  return Boolean(flags.turnstileEnabled)
})

function mapFieldToSchema(field: DynamicContentField): Record<string, unknown> {
  const dataType = String(field.type || field.schema?.data_type || '').toLowerCase()
  const fieldInterface = String(field.meta?.interface || '').toLowerCase()

  if (fieldInterface.includes('datetime') || ['datetime', 'timestamp', 'date', 'time'].includes(dataType)) {
    return { type: 'string', format: 'date', title: field.meta?.note || field.name || field.field }
  }

  if (fieldInterface.includes('file') || dataType === 'file') {
    return { type: 'string', format: 'file', title: field.meta?.note || field.name || field.field }
  }

  if (fieldInterface.includes('rich-text') || dataType === 'text') {
    return { type: 'string', format: 'richtext', title: field.meta?.note || field.name || field.field }
  }

  if (dataType === 'boolean') {
    return { type: 'boolean', title: field.meta?.note || field.name || field.field }
  }

  if (['integer', 'bigint', 'float', 'decimal', 'number'].includes(dataType)) {
    return { type: 'number', title: field.meta?.note || field.name || field.field }
  }

  return { type: 'string', title: field.meta?.note || field.name || field.field }
}

const visibleFields = computed(() => {
  const source = props.fields.length ? props.fields : schemaFields.value
  return (source || []).filter((field) => !field?.meta?.hidden)
})

const formSchema = computed(() => {
  const properties: Record<string, unknown> = {}
  const required: string[] = []

  for (const field of visibleFields.value) {
    const key = String(field.field || '')
    if (!key) continue
    properties[key] = mapFieldToSchema(field)
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

watch(
  formSchema,
  (next) => {
    const target = form.schema as Record<string, any>
    target.type = next.type
    target.properties = next.properties
    target.required = next.required
  },
  { immediate: true, deep: true },
)

function emitModel() {
  emit('update:modelValue', { ...form.model })
}

function updateField(key: string, value: unknown) {
  form.setValue(key, value)
  emitModel()
}

async function loadFormSchema() {
  if (props.fields.length) {
    return
  }

  const loaded = await loadSchemaForCollection(props.collection)
  if (!loaded.length && schemaError.value) {
    emit('error', schemaError.value)
  }
}

async function submitForm() {
  submitting.value = true
  submitError.value = null
  try {
    if (turnstileEnabled.value) {
      if (!turnstileToken.value) {
        submitError.value = 'Please complete the Turnstile verification.'
        return
      }

      await $fetch('/api/validateTurnstile', {
        method: 'POST',
        body: { token: turnstileToken.value },
      })
    }

    const validation = form.validate()
    if (!validation.valid) {
      submitError.value = validation.issues[0]?.message || 'Invalid form values.'
      return
    }

    const created = await $directus.request($createItem(props.collection, { ...form.model }))
    emit('submitted', created)

    if (props.clearOnSuccess) {
      form.reset()
      emitModel()
    }

    if (turnstileEnabled.value) {
      turnstile.value?.reset?.()
      turnstileToken.value = ''
    }
  } catch (err: any) {
    submitError.value = err?.message || 'Unable to submit form.'
    emit('error', err)

    if (turnstileEnabled.value) {
      turnstile.value?.reset?.()
      turnstileToken.value = ''
    }
  } finally {
    submitting.value = false
  }
}

onMounted(loadFormSchema)

watch(
  () => props.collection,
  async () => {
    await loadFormSchema()
  },
)
</script>

<style scoped>
.dynamic-form-error {
  color: #b91c1c;
  margin-bottom: 0.75rem;
}
</style>
