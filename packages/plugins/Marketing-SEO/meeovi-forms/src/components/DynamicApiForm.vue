<template>
  <JsonFormRenderer
    v-if="apiConfig"
    :schema="apiConfig.schema"
    :uischema="apiConfig.uiSchema"
    :model-value="model"
    :submitting="submitting"
    config="{ submitMethod: apiConfig.submitMethod || 'POST' }"
    @update:model-value="onChange"
    @submit="onSubmit"
    @reset="onReset"
  />
  <div v-else class="meeovi-forms-error">
    Form not found: {{ apiName }}
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useApiForm } from '../composables/useApiForm'
import JsonFormRenderer from '../components/JsonFormRenderer.vue'

const props = withDefaults(defineProps<{
  /** Name of the registered API form */
  api: string
  /** Optional initial values */
  modelValue?: Record<string, any>
}>(), {
  modelValue: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  submitted: [value: any]
  error: [value: any]
}>()

const { apiConfig, form, submitting, submit, reset, validate } = useApiForm({
  apiName: props.api,
  initialValue: props.modelValue
})

const model = computed({
  get: () => form.value,
  set: (value) => emit('update:modelValue', value || {})
})

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return
    const next = value as Record<string, any>
    for (const key of Object.keys(form.value)) {
      if (!(key in next)) {
        ;(form.value as Record<string, any>)[key] = apiConfig.value?.defaults?.[key] ?? null
      }
    }
    for (const [key, val] of Object.entries(next)) {
      ;(form.value as Record<string, any>)[key] = val
    }
  },
  { deep: true }
)

function onChange (value: Record<string, any>) {
  model.value = value
}

async function onSubmit () {
  const validation = validate()
  if (!validation.valid) {
    emit('error', validation.issues[0]?.message || 'Invalid form values.')
    return
  }

  const result = await submit()
  if (result) {
    emit('submitted', result)
    emit('update:modelValue', { ...form.value })
  }
}

function onReset () {
  reset()
  emit('update:modelValue', { ...form.value })
}
</script>

<style scoped>
.meeovi-forms-error {
  color: #b91c1c;
  padding: 0.5rem;
}
</style>
