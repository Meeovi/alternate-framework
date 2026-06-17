<template>
  <form class="ui-forms-renderer" @submit.prevent="onSubmitInternal">
    <JsonForms
      :data="modelValue"
      :schema="schema"
      :uischema="uischema"
      :renderers="renderers"
      :cells="cells"
      :config="config"
      @change="onChange"
    />

    <div class="ui-forms-controls">
      <v-btn type="submit" color="primary" :loading="submitting">
        Submit
      </v-btn>
      <v-btn type="button" variant="text" @click="onReset">
        Reset
      </v-btn>
    </div>
  </form>
</template>

<script setup lang="ts">
import { markRaw } from 'vue'
import { JsonForms, type JsonFormsChangeEvent } from '@jsonforms/vue'
import { VBtn } from 'vuetify/components'
import { createDefaultRendererRegistry } from '../renderers'
import '@jsonforms/vue-vuetify/lib/jsonforms-vue-vuetify.css'

const props = withDefaults(defineProps<{
  schema: Record<string, any>
  modelValue: Record<string, any>
  uischema?: Record<string, any>
  submitting?: boolean
  config?: Record<string, any>
}>(), {
  submitting: false,
  config: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [Record<string, any>]
  submit: []
  reset: []
}>()

const { renderers: unprocessedRenderers, cells: unprocessedCells } = createDefaultRendererRegistry()
const renderers = markRaw(unprocessedRenderers)
const cells = markRaw(unprocessedCells)

const onChange = (event: JsonFormsChangeEvent) => {
  emit('update:modelValue', event.data ?? {})
}

const onSubmitInternal = () => emit('submit')
const onReset = () => emit('reset')
</script>

<style scoped>
.ui-forms-renderer {
  display: grid;
  gap: 1rem;
}

.ui-forms-controls {
  display: flex;
  gap: 0.75rem;
}
</style>
