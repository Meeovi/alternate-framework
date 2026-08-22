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
import { useJsonForm, mapSchemaDefaults } from '@mframework/meeovi-forms'
import DynamicFormElement from './DynamicFormElement.vue'
import { useDirectusFields } from '../composables/useDirectusFields'
import useSSF from '#shared/app/composables/security/ssf'

const props = withDefaults(defineProps<{
  collection: string
  id?: string | number
  modelValue?: Record<string, unknown>
  fields?: any[]
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

const { $directus, $readItem, $updateItem, $createItem } = useNuxtApp() as any
const { fields: schemaFields, loading, error: schemaError, loadFields } = useDirectusFields()

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

const visibleFields = computed(() => {
  const source = props.fields.length ? props.fields : schemaFields.value
  return (source || []).filter((field: any) => !field?.meta?.hidden)
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

watch(
  formSchema,
  (next) => {
    const target = form.schema as Record<string, any>
    target.type = next.type
    target.properties = next.properties
    target.required = next.required
    // Seed the model with schema defaults once fields load so every field has
    // a defined value (prevents "modelValue = undefined" warnings and guarantees
    // proper initial binding). Existing values are preserved.
    const defaults = mapSchemaDefaults(next)
    for (const [key, val] of Object.entries(defaults)) {
      if (!(key in form.model)) {
        ;(form.model as Record<string, unknown>)[key] = val
      }
    }
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

  const loaded = await loadFields(props.collection)
  if (!loaded.length && schemaError.value) {
    emit('error', schemaError.value)
  }
}

async function loadExistingItem() {
  if (!props.id) {
    return
  }

  try {
    const item = await $directus.request($readItem(props.collection, props.id))
    if (item) {
      for (const key of Object.keys(form.model)) {
        if (key in (item as Record<string, unknown>)) {
          ;(form.model as Record<string, unknown>)[key] = (item as Record<string, unknown>)[key]
        }
      }
      emitModel()
    }
  } catch (err: any) {
    submitError.value = err?.message || 'Unable to load existing item.'
    emit('error', err)
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

    let created: unknown
    if (props.id) {
      created = await $directus.request($updateItem(props.collection, props.id, { ...form.model }))
    } else {
      created = await $directus.request($createItem(props.collection, { ...form.model }))
    }
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

onMounted(() => {
  loadFormSchema()
  loadExistingItem()
})

watch(
  () => props.collection,
  async () => {
    await loadFormSchema()
    if (props.id) {
      await loadExistingItem()
    }
  },
)

watch(
  () => props.id,
  async () => {
    if (props.id) {
      await loadExistingItem()
    }
  },
)
</script>

<style scoped>
.dynamic-form-error {
  color: #b91c1c;
  margin-bottom: 0.75rem;
}
</style>
