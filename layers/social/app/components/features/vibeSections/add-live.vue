<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <v-card class="b-1">
        <v-card-title>
          <h3>Create New Vibe</h3>
        </v-card-title>

        <v-card-text>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <v-form @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in shortFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <v-btn type="submit">Create</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref, reactive } from '#imports'
import DirectusFormElement from '#shared/app/components/ui/forms/DirectusFormElement.vue'
const dialog = ref(false)
const { readFieldsByCollection, createItem } = useSdkContentAdapter()

const form = reactive({})
const formError = ref('')
const formSuccess = ref('')

const { data, error } = await useAsyncData('shorts', async () => {
  const resp = await readFieldsByCollection('shorts')
  return resp?.data || resp || []
})

if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
  console.error(error)
  throw createError({
    statusCode: 404,
    statusMessage: 'Vibe not found'
  })
}

const shortFields = data

for (const field of shortFields.value || []) {
  if (field?.field && !(field.field in form)) {
    form[field.field] = null
  }
}

const submitForm = async () => {
  formError.value = ''
  formSuccess.value = ''

  try {
    await createItem('shorts', { ...form })
    formSuccess.value = 'Vibe created successfully.'
    for (const key of Object.keys(form)) {
      form[key] = null
    }
    dialog.value = false
  } catch (err) {
    formError.value = (err && err.message) ? err.message : 'Failed to create vibe.'
  }
}
</script>