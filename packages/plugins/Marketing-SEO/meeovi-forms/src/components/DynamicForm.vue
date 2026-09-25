<template>
  <div>
    <div v-if="loading">Loading form schema...</div>
    <div v-else-if="schemaError" class="dynamic-form-error">{{ schemaError }}</div>
    <v-form v-else @submit.prevent="submitForm">
      <!-- Shown above the form rather than instead of it, so a failed
           submit doesn't throw away everything the user typed. -->
      <div v-if="submitError" class="dynamic-form-error">{{ submitError }}</div>
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
import { filterDisplayFields, fileUrlFieldName, isFileField } from '../utils/directusFields'
import { DEFAULT_UPLOAD_ENDPOINT, uploadFileValues } from '../utils/uploadFiles'
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

// Only plain fields render here — relationship fields (m2o/o2m/m2m/m2a/
// translations) are dropped along with hidden ones. See
// utils/directusFields.ts.
const allFields = computed(() => (props.fields.length ? props.fields : schemaFields.value) || [])

// `<file>_url` companions hold the uploaded file's Pixanomy link and are
// filled on submit — the file picker is the input, so don't also render
// them as a plain text box.
const fileUrlCompanions = computed(() => new Set(
  allFields.value.filter(isFileField).map((f) => fileUrlFieldName(String(f.field)))
))

const visibleFields = computed(() =>
  filterDisplayFields(allFields.value).filter((f) => !fileUrlCompanions.value.has(String(f.field)))
)

const formSchema = computed(() => {
  const properties: Record<string, unknown> = {}
  const required: string[] = []

  for (const field of visibleFields.value) {
    const key = String(field.field || '')
    if (!key) continue
    // File fields hold a File (new upload) or an existing id/URL — not
    // necessarily a string — until submit, so leave them untyped.
    properties[key] = isFileField(field)
      ? { title: field.meta?.note || field.name || field.field }
      : { type: 'string', title: field.meta?.note || field.name || field.field }
    // NOT NULL columns with a database default (e.g. status → 'draft')
    // don't need a value from the user.
    const dbDefault = field.schema?.default_value
    // Alias fields (links, dividers, groups…) have no column at all
    // (schema: null) — that isn't the same as NOT NULL.
    const notNull = field.schema?.is_nullable === false
    if (field.meta?.required || (notNull && (dbDefault === null || dbDefault === undefined))) {
      required.push(key)
    }
    if (dbDefault !== null && dbDefault !== undefined) {
      ;(properties[key] as Record<string, unknown>).default = dbDefault
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

/**
 * Upload any picked files to Pixanomy (via uploadFileValues) and move each
 * resulting URL from the Directus file relation (a uuid — can't hold a URL)
 * into its `<field>_url` companion. Untouched file fields (an existing
 * Directus id) are sent back unchanged.
 */
async function buildPayload() {
  const model = { ...form.model } as Record<string, unknown>
  const pickedFiles = allFields.value
    .filter(isFileField)
    .map((f) => String(f.field))
    .filter((key) => typeof File !== 'undefined' && model[key] instanceof File)

  const known = new Set(allFields.value.map((f) => String(f.field)))
  const missing = pickedFiles.filter((key) => !known.has(fileUrlFieldName(key)))
  if (missing.length) {
    throw new Error(`Can't store uploads for ${missing.join(', ')}: add a "${fileUrlFieldName(missing[0]!)}" string field to ${props.collection}.`)
  }

  const uploadEndpoint = (useRuntimeConfig().public as any)?.meeoviForms?.uploadEndpoint || DEFAULT_UPLOAD_ENDPOINT
  const payload = await uploadFileValues(model, uploadEndpoint, props.collection)
  for (const key of pickedFiles) {
    payload[fileUrlFieldName(key)] = payload[key]
    delete payload[key]
  }

  // Every field is seeded with '' so inputs have a defined value, but ''
  // isn't valid for non-text columns (integer, timestamp, uuid, json…) —
  // leave untouched ones out on create, and clear them to null on edit.
  const TEXT_TYPES = new Set(['string', 'text', 'csv', 'hash'])
  for (const field of allFields.value) {
    const key = String(field.field)
    // Alias fields have no column to write to.
    if (field.type === 'alias') { delete payload[key]; continue }
    if (payload[key] !== '' || TEXT_TYPES.has(String(field.type))) continue
    if (props.id) payload[key] = null
    else delete payload[key]
  }
  return payload
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
      const issue = validation.issues[0]
      const label = issue && (formSchema.value.properties[issue.path] as { title?: string } | undefined)?.title
      submitError.value = issue ? `${label || issue.path}: ${issue.message}` : 'Invalid form values.'
      return
    }

    const payload = await buildPayload()

    let created: unknown
    if (props.id) {
      created = await $directus.request($updateItem(props.collection, props.id, payload))
    } else {
      created = await $directus.request($createItem(props.collection, payload))
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
    // Directus/ofetch errors carry the useful text in errors[0].message.
    const detail = err?.errors?.[0]?.message || err?.data?.errors?.[0]?.message || err?.data?.statusMessage || err?.message
    submitError.value = `Couldn't save${detail ? ` (${detail})` : ''}. Please try again.`
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
