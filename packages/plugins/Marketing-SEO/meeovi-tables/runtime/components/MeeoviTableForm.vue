<script setup lang="ts">
import { computed, ref } from 'vue'
import { Editor, registerEditorItem } from '@svar-ui/vue-editor'
import { DatePicker, RichSelect } from '@svar-ui/vue-core'
import '@svar-ui/vue-editor/all.css'
import type { MeeoviTableField } from '../types'

/**
 * Add / edit form for one row, generated from the table's Directus-derived
 * schema with SVAR's Editor (sidebar). Emits only the values to send:
 * every editable field on create, the changed ones on edit.
 */
const props = defineProps<{
  schema: MeeoviTableField[]
  /** The row being edited; null = new row. */
  row: Record<string, unknown> | null
  title: string
  saving?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'save', data: Record<string, unknown>): void
  (e: 'close'): void
}>()

registerEditorItem('select', RichSelect)
registerEditorItem('date', DatePicker)

const isNew = computed(() => !props.row)

// Fields shown: editable ones (minus those Directus hides in its own UI);
// on edit also the read-only ones, as text.
const fields = computed(() => props.schema.filter((f) => !f.hidden && (!f.readonly || !isNew.value)))

function toFormValue(field: MeeoviTableField, value: unknown) {
  if (value == null) return field.type === 'boolean' ? false : ''
  if (field.type === 'date' || field.type === 'datetime') {
    const d = new Date(String(value))
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (field.type === 'json') return JSON.stringify(value, null, 2)
  return value
}

function fromFormValue(field: MeeoviTableField, value: unknown) {
  if (value === '' || value == null) return null
  switch (field.type) {
    case 'number': {
      const n = Number(value)
      return Number.isFinite(n) ? n : value
    }
    case 'boolean': return Boolean(value)
    case 'date': return value instanceof Date ? value.toISOString().slice(0, 10) : value
    case 'datetime': return value instanceof Date ? value.toISOString() : value
    case 'json': return typeof value === 'string' ? JSON.parse(value) : value
    default: return value
  }
}

const values = ref<Record<string, unknown>>(Object.fromEntries(
  fields.value.map((f) => [f.field, toFormValue(f, props.row?.[f.field])]),
))

const items = computed(() => fields.value.map((f) => {
  const base = { key: f.field, label: f.label + (f.required && !f.readonly ? ' *' : '') }
  if (f.readonly) return { ...base, comp: 'readonly' }
  if (f.choices) return { ...base, comp: 'select', options: f.choices, required: f.required }
  switch (f.type) {
    case 'boolean': return { ...base, comp: 'checkbox' }
    case 'date':
    case 'datetime': return { ...base, comp: 'date', required: f.required }
    case 'text': return { ...base, comp: 'textarea', required: f.required }
    case 'json': return {
      ...base, comp: 'textarea', required: f.required,
      validation: (v: unknown) => { try { if (v) JSON.parse(String(v)); return true } catch { return false } },
      validationMessage: 'Must be valid JSON',
    }
    case 'number': return {
      ...base, comp: 'text', required: f.required,
      validation: (v: unknown) => v === '' || v == null || Number.isFinite(Number(v)),
      validationMessage: 'Must be a number',
    }
    default: return { ...base, comp: 'text', required: f.required }
  }
}))

function onSave(ev: { changes: string[], values: Record<string, unknown> }) {
  const keys = isNew.value ? fields.value.filter((f) => !f.readonly).map((f) => f.field) : ev.changes
  const data: Record<string, unknown> = {}
  for (const key of keys) {
    const field = fields.value.find((f) => f.field === key)
    if (!field || field.readonly) continue
    data[key] = fromFormValue(field, ev.values[key])
  }
  emit('save', data)
}

function onAction(ev: { item?: { id?: string } }) {
  if (ev.item?.id === 'cancel' || ev.item?.id === 'close') emit('close')
}
</script>

<template>
  <Editor
    :values="values"
    :items="items"
    placement="sidebar"
    css="meeovi-table-form"
    :top-bar="{ items: [
      { comp: 'label', text: title },
      { comp: 'spacer' },
      { id: 'cancel', comp: 'button', text: 'Cancel' },
      { id: 'save', comp: 'button', type: 'primary', text: saving ? 'Saving…' : 'Save', disabled: saving },
    ] }"
    :bottom-bar="false"
    :auto-save="false"
    focus
    :onsave="onSave"
    :onaction="onAction"
  >
    <div v-if="error" class="meeovi-table-form__error">{{ error }}</div>
  </Editor>
</template>

<style>
/* SVAR's side panel is absolute with z-index 1001 — under app headers
   (Vuetify's app bar is 1004) and scrolled away on long pages. Pin this
   form's panel to the viewport, above the page chrome. */
.wx-sidearea:has(.meeovi-table-form) {
  position: fixed;
  z-index: 2100;
}

.meeovi-table-form__error {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 6px;
  background: #fdecea;
  color: #8a1c13;
}
</style>
